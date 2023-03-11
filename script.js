//create video texture
const texture = new THREE.VideoTexture(document.getElementById("video"));
const textureSky = new THREE.VideoTexture(document.getElementById("sky"));

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  canvas: document.getElementById("canvas")
});

const geometry = new THREE.PlaneGeometry(2, 2);
const uniforms = {
  color: { value: new THREE.Color() },
  keyColor: { value: new THREE.Color() },
  threshold: { value: 0 },
  video: { value: texture },
  sky: { value: textureSky },
  useSky: { value: true },
  transparent: { value: false }
};

const vertexShader = `

void main() {
	gl_Position = vec4( position, 1.0 );
}
`;
const fragmentShader = `
uniform vec3 keyColor;
uniform vec3 color;
uniform float threshold;
uniform sampler2D video;
uniform sampler2D sky;
uniform bool useSky;
uniform bool transparent;

float paddingY = 30.;
vec2 resolution = vec2(320,240);
void main() {
  if(gl_FragCoord.y<paddingY || gl_FragCoord.y>(resolution.y-paddingY))return;
  vec2 uv = vec2(gl_FragCoord.x,gl_FragCoord.y-paddingY)/(resolution-vec2(.0,paddingY*2.));
  // vec2 uv = gl_FragCoord.xy/resolution;
  
  vec4 texColor = texture2D(video,uv);
  vec4 skyColor = texture2D(sky,uv);
  
  float diff = distance(vec3(texColor.xyz), keyColor);
  if(diff<threshold){
    float alpha = transparent ? 0. : 1.;
    if(useSky){
      gl_FragColor = vec4(skyColor.xyz,alpha);
    }else{
      gl_FragColor = vec4(color,alpha);
    }
  }else{
      gl_FragColor = texColor;
  }
}
`;

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
});
material.transparent = true;

const scene = new THREE.Scene();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const colorPicker = document.getElementById("color");
const keyColorPicker = document.getElementById("keyColor");
const threshold = document.getElementById("threshold");
const useSky = document.getElementById("useSky");
const transparent = document.getElementById("transparent");

const render = () => {
  material.uniforms.color.value = new THREE.Color(colorPicker.value);
  material.uniforms.keyColor.value = new THREE.Color(keyColorPicker.value);
  material.uniforms.threshold.value = threshold.value * 1e-2;
  material.uniforms.useSky.value = useSky.checked;
  material.uniforms.transparent.value = transparent.checked;

  requestAnimationFrame(render);
  renderer.render(scene, new THREE.Camera());
};
render();

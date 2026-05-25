import * as THREE from 'three';

// 1. Definição estática dos materiais
const cB = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x444444, emissiveIntensity: 2.5 });
const cV = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x440000, emissiveIntensity: 2.5 });
const cA = new THREE.MeshStandardMaterial({ color: 0x0055ff, emissive: 0x001155, emissiveIntensity: 2.5 });
const cVerde = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x004400, emissiveIntensity: 2.5 });
const cCiano = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x004444, emissiveIntensity: 2.5 });
const cAmarelo = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0x444400, emissiveIntensity: 2.5 });
const cRoxo = new THREE.MeshStandardMaterial({ color: 0xaa00ff, emissive: 0x4400aa, emissiveIntensity: 2.5 });
const cLaranja = new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0x884400, emissiveIntensity: 2.5 });

// 2. Dicionário de matrizes (geração procedural)
const catalogoNaves = {
    Kamikaze: [
        [0, 3, cV], [-1, 2, cV], [1, 2, cV], [-2, 1, cAmarelo], [2, 1, cAmarelo],
        [0, 2, cV], [0, 1, cB], [0, 0, cV], [-1, -1, cLaranja], [1, -1, cLaranja]
    ],
    Caca: [
        [0, 2, cCiano], [0, 1, cB], [0, 0, cA], [0, -1, cB],
        [-1, 0, cCiano], [1, 0, cCiano], [-2, -1, cA], [2, -1, cA],
        [-2, 0, cB], [2, 0, cB], [0, -2, cV]
    ],
    Tanque: [
        [0, 2, cV], [0, 1, cVerde], [0, 0, cVerde], [-1, 0, cVerde], [1, 0, cVerde],
        [-2, 1, cCiano], [2, 1, cCiano], [-2, 0, cCiano], [2, 0, cCiano], 
        [-2, -1, cCiano], [2, -1, cCiano], [-1, -1, cAmarelo], [1, -1, cAmarelo]
    ],
    Boss: [
        [0, 4, cV], [0, 3, cV], [0, 2, cB], [0, 1, cB], [0, 0, cV],
        [-1, 2, cLaranja], [1, 2, cLaranja], [-1, 1, cLaranja], [1, 1, cLaranja],
        [-2, 1, cRoxo], [2, 1, cRoxo], [-3, 0, cRoxo], [3, 0, cRoxo],
        [-2, -1, cV], [2, -1, cV], [0, -1, cAmarelo]
    ]
};

// 3. Exportação da função construtora
export function fabricarInimigo2D(tipoDaNave, valorPontos, geoSetaGlobal, scene) {
    const matriz = catalogoNaves[tipoDaNave];
    if (!matriz) return new THREE.Group();
    
    const contentor = new THREE.Group(); 
    const geometria = new THREE.BoxGeometry(1, 1, 1);
    
    matriz.forEach(bloco => {
        const cubo = new THREE.Mesh(geometria, bloco[2]); 
        cubo.position.set(bloco[0], bloco[1], 0); 
        contentor.add(cubo);
    });
    
    contentor.scale.set(0.55, 0.55, 0.55);

    const matSeta = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0 });
    const seta = new THREE.Mesh(geoSetaGlobal, matSeta); 
    seta.renderOrder = 999; 
    scene.add(seta);
    
    contentor.userData = {
        tipo: tipoDaNave, pontos: valorPontos, estado: 'ATACANDO',
        vida: (tipoDaNave === 'Boss') ? 10 : (tipoDaNave === 'Tanque' ? 3 : 1),
        setaGui: seta, anguloMovimento: 0, velocidade: 0.2
    };
    
    return contentor;
}
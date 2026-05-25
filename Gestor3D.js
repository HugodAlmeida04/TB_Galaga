import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const cacheModelos3D = {};
const filasEspera = {}; 

// Carregador global de texturas de imagem
const textureLoader = new THREE.TextureLoader(); 


// 1. NAVE DO JOGADOR 
export function carregarNaveJogador(contentorVisual3D, nomeFicheiro) {
    const loader = new GLTFLoader();
    
    loader.load(nomeFicheiro, (gltf) => { 
        const modelo = gltf.scene;
        
        // CONTROLO DE TAMANHO E ROTAÇÃO DA TUA NAVE:
        modelo.scale.set(0.5, 0.5, 0.5); 
        modelo.rotation.x = Math.PI / 2;
        modelo.rotation.y = -Math.PI / 2;
        modelo.rotation.z = 0;

        contentorVisual3D.add(modelo);
    });
}

// 2. NAVES INIMIGAS (Modelos + Texturas + Controlos Dinâmicos)
export function inicializarCacheInimigos3D() {
    const loader = new GLTFLoader();
    
    // Mapeamento dos ficheiros originais .glb
    const ficheiros = {     
        Kamikaze: 'Modelos_3D/KAMIKAZE.glb',
        Caca: 'Modelos_3D/Caca.glb', 
        Tanque: 'Modelos_3D/Tanque_Ship.glb',
        Boss: 'Modelos_3D/Galra_Ship.glb'
    };

    // Mapeamento das imagens de textura
    const imagensTexturas = {
       Kamikaze: 'Texturas/Textura_KAMIKAZE_ship.png',
        Caca: 'Texturas/Textura_Caca_ship.png',
        Tanque: 'Texturas/Textura_Tanque_ship.png',
        Boss: 'Texturas/Textura_GALRA_SHIP.png'
    };

    // [CONTROLO DE TAMANHO] Altera estes números para redimensionar no espaço
    const escalas = { 
        Kamikaze: 15.0, 
        Caca: 20.0, 
        Tanque: 75.0, 
        Boss: 100.0 
    };

    // [CONTROLO DE ROTAÇÃO] Configurado com Math.PI / 2 no eixo X (Roda 90º para baixo)
    const rotacoes = {
        Kamikaze: { x: Math.PI / 2, y: 0, z: 0 }, 
        Caca:     { x: Math.PI / 2, y: 0, z: 0 },
        Tanque:   { x: Math.PI / 2, y: 0, z: 0 },
        Boss:     { x: Math.PI / 2, y: Math.PI, z: 0 }
    };

    
    const propriedadesMaterial = {
        Kamikaze: { roughness: 0.10, metalness: 0.85, corFallback: 0x550000, luz: 0.4 }, 
        Caca:     { roughness: 0.12, metalness: 0.80, corFallback: 0x002255, luz: 0.4 }, 
        Tanque:   { roughness: 0.15, metalness: 0.85, corFallback: 0x004400, luz: 0.85 }, 
        Boss:     { roughness: 0.05, metalness: 0.95, corFallback: 0x330055, luz: 0.4 }  
    };

    Object.keys(ficheiros).forEach(tipo => {
        filasEspera[tipo] = []; 
        
        loader.load(ficheiros[tipo], (gltf) => {
            const modelo = gltf.scene;
            
            // Aplica as definições de Tamanho
            const s = escalas[tipo] || 1.0;
            modelo.scale.set(s, s, s); 
            
            // Aplica as definições de Rotação (90º para baixo)
            const r = rotacoes[tipo] || { x: 0, y: 0, z: 0 };
            modelo.rotation.x = r.x;
            modelo.rotation.y = r.y;
            modelo.rotation.z = r.z;

            const pbr = propriedadesMaterial[tipo];

            // Configuração física inicial de alto brilho
            modelo.traverse((filho) => {
                if (filho.isMesh && filho.material) {
                    filho.material.roughness = pbr.roughness; 
                    filho.material.metalness = pbr.metalness; 
                    
                    // Configuração de segurança temporária (Néon) caso a imagem falhe
                    filho.material.emissive = new THREE.Color(pbr.corFallback); 
                    filho.material.emissiveIntensity = 1.0;
                    filho.material.needsUpdate = true;
                }
            });

            // Aplicação da imagem da textura com remoção do washout de cor única
            // Aplicação da imagem da textura com cores vivas
            textureLoader.load(
                imagensTexturas[tipo],
                (texturaCarregada) => {
                    texturaCarregada.flipY = false;
                    texturaCarregada.colorSpace = THREE.SRGBColorSpace;
                    
                    modelo.traverse((filho) => {
                        if (filho.isMesh && filho.material) {
                            // 1. Injeta a imagem normal
                            filho.material.map = texturaCarregada;
                            
                            // 2. Diz ao material para emitir luz usando a própria imagem
                            filho.material.emissiveMap = texturaCarregada;
                            
                            // 3. Define a cor da luz como branca (0xffffff) para não distorcer os tons da tua textura
                            filho.material.emissive = new THREE.Color(0xffffff);
                            
                            // 4. LÊ O VALOR DA LUZ DO NOSSO DICIONÁRIO PARA CADA CLASSE
                            filho.material.emissiveIntensity = pbr.luz; 
                            
                            // 5. Opcional: Baixar ligeiramente o metalness aqui ajuda a textura a ler melhor
                            filho.material.metalness = 0.5;

                            filho.material.needsUpdate = true;
                        }
                    });
                },
                undefined,
                (erro) => {
                    console.warn(`[Gestor3D] Sem textura externa para ${tipo}. A usar cor emissiva base.`);
                }
            );

            cacheModelos3D[tipo] = modelo;

            filasEspera[tipo].forEach(contentorPendente => {
                contentorPendente.add(modelo.clone());
            });
            filasEspera[tipo] = []; 
            
        }, undefined, (erro) => {
            console.error(`[Gestor3D] Erro crítico ao carregar GLB de ${tipo}:`, erro);
        });
    });
}

export function obterClone3DInimigo(tipoDaNave) {
    const contentorProxy = new THREE.Group();
    contentorProxy.name = "mesh3D";

    if (cacheModelos3D[tipoDaNave]) {
        contentorProxy.add(cacheModelos3D[tipoDaNave].clone());
    } else {
        if (filasEspera[tipoDaNave]) {
            filasEspera[tipoDaNave].push(contentorProxy);
        }
    }
    
    return contentorProxy;
}
import * as THREE from 'three';

const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

// Canais de áudio separados
const musicaFundo = new THREE.Audio(listener);
const efeitosSonoros = new THREE.Audio(listener);

export function inicializarAudio(camera) {
    camera.add(listener); // A câmara é os "ouvidos" do jogo
}

export function tocarMusica(ficheiro) {
    audioLoader.load(ficheiro, (buffer) => {
        musicaFundo.setBuffer(buffer);
        musicaFundo.setLoop(true);
        musicaFundo.setVolume(0.5);
        musicaFundo.play();
    });
}

export function dispararEfeito(ficheiro) {
    audioLoader.load(ficheiro, (buffer) => {
        // Criamos uma nova instância para permitir que sons sobreponham
        const som = new THREE.Audio(listener);
        som.setBuffer(buffer);
        som.setVolume(0.8);
        som.play();
    });
}
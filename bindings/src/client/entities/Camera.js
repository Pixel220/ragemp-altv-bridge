import * as alt from 'alt-client';
import * as natives from 'natives';
import mp from '../../shared/mp.js';
import { rotToDir } from '../../shared/utils';
import { ClientPool } from '../ClientPool';
import {EntityStoreView} from '../../shared/pools/EntityStoreView';

const view = new EntityStoreView();

class _Camera {
    constructor(handle) {
        this.handle = handle;
        this.id = view.getId();
        view.add(this, this.id, handle);
    }

    destroy() {
        view.remove(this.id, this.handle);
        natives.destroyCam(this.handle, false);
    }

    getPosition() {
        return new mp.Vector3(natives.getCamCoord(this.handle));
    }

    setPosition(pos) {
        natives.setCamCoord(this.handle, pos.x, pos.y, pos.z);
    }

    getDirection() {
        return new mp.Vector3(rotToDir(natives.getCamRot(this.handle, 2).toRadians()));
    }

    get pointAt() {
        return this.pointAtEntity;
    }

    get attachTo() {
        return this.attachToEntity;
    }

    setActive(value) {
        natives.setCamActive(this.handle, value);
        natives.renderScriptCams(true, false, 0, true, false, 0);
    }
}

class _GameplayCamera extends _Camera {
    constructor(handle) {
        super(handle);
        Object.defineProperty(this, 'handle', { get: () => natives.getRenderingCam() });
    }

    getPosition() {
        return new mp.Vector3(natives.getGameplayCamCoord());
    }

    getCoord() {
        return this.getPosition();
    }

    getRot() {
        return natives.getGameplayCamRot(2);
    }

    getFov() {
        return natives.getGameplayCamFov();
    }

    isRendering() {
        return natives.isGameplayCamRendering();
    }

    getDirection() {
        return new mp.Vector3(rotToDir(natives.getGameplayCamRot(2).toRadians()));
    }

    destroy() {}
}

mp.Camera = _Camera;

mp.cameras = new ClientPool(view);

// smart getter
Object.defineProperty(mp.cameras, 'gameplay', {
    get() {
        delete mp.cameras.gameplay;
        return mp.cameras.gameplay = new _GameplayCamera(natives.getRenderingCam());
    },
    configurable: true
});

mp.cameras.new = function(name, pos, rot, fov) {
    if (name === 'gameplay') {
        return mp.cameras.gameplay;
    }

    const handle = natives.createCamWithParams('DEFAULT_SCRIPTED_CAMERA', pos.x, pos.y, pos.z, rot.x, rot.y, rot.z, fov, false, 2);
    return new _Camera(handle);
};

import * as alt from 'alt-client';
import mp from '../../shared/mp.js';
import {ClientPool} from '../ClientPool.js';
import {_BaseObject} from './BaseObject.js';
import {EntityGetterView} from '../../shared/pools/EntityGetterView';

export class _Checkpoint extends _BaseObject {
    /** @param {alt.Checkpoint} alt */
    constructor(alt) {
        super();
        this.alt = alt;
    }

    get id() {
        return this.alt.id;
    }

    get type() {
        return 'checkpoint';
    }

    destroy() {
        this.alt.destroy();
    }
}

Object.defineProperty(alt.Checkpoint.prototype, 'mp', {
    get() {
        return this._mp ??= new _Checkpoint(this);
    }
});

mp.Checkpoint = _Checkpoint;

mp.checkpoints = new ClientPool(EntityGetterView.fromClass(alt.Checkpoint));

mp.checkpoints.new = function (type, pos, radius, options) {
    const checkpoint = new alt.Checkpoint(type, pos, options.nextPos ?? new alt.Vector3(0, 0, 0), radius, 100, options.color ? new alt.RGBA(...options.color) : alt.RGBA.red);
    return checkpoint.mp;
};

import alt from 'alt-server';
import { ServerPool } from './ServerPool.js';
import mp from 'shared/mp';
import { InternalChat } from 'shared/DefaultChat.js';
import {argsToAlt, mpDimensionToAlt} from 'shared/utils';

export class PlayerPool extends ServerPool {
    broadcast(text) {
        InternalChat.broadcast(text);
    }

    //mp.players.call(String eventName[, Array Arguments]);
    //mp.players.call(Array players, String eventName[, Array Arguments]);
    call(arg1, args1 = [], args2 = []) {
        if(typeof arg1 === 'string') {
            alt.emitAllClients(arg1, ...argsToAlt(args1));
        } else if(typeof arg1 === 'object' && Array.isArray(arg1)) {
            const players = arg1.map(p => p.alt).filter(Boolean);
            if (players.length) alt.emitClient(players, args1, ...argsToAlt(args2));
        }
    }

    callUnreliable(arg1, args1 = [], args2 = []) {
        if(typeof arg1 === 'string') {
            (mp._forceReliable ? alt.emitAllClients : alt.emitAllClientsUnreliable)(arg1, ...argsToAlt(args1));
        } else if(typeof arg1 === 'object' && Array.isArray(arg1)) {
            const players = arg1.map(p => p.alt).filter(Boolean);
            if (players.length) (mp._forceReliable ? alt.emitClient : alt.emitClientUnreliable)(players, args1, ...argsToAlt(args2));
        }
    }

    // todo: callInRange(pos, range, dimension, event, ...args)
    callInRange(pos, range, event, args) {
        const rangeSquared = range ** 2;
        const players = alt.Player.all.filter(e => e.pos.distanceToSquared(pos) <= rangeSquared);
        if (players.length) alt.emitClient(players, event, ...argsToAlt(args));
    }

    callInDimension(dimension, event, args) {
        dimension = mpDimensionToAlt(dimension);
        const players = alt.Player.all.filter(e => e.dimension === dimension);
        if (players.length) alt.emitClient(players, event, ...argsToAlt(args));
    }
    /*
    broadcastInDimension(dimension, text){}
    broadcastInRange(position, range, [dimension], text){}
    callInDimension(dimension, eventName, [, ...args]){}
    callInRange(position, range, [dimension], eventName, [, ...args]){}
    callUnreliable(eventName, [, ...args]){}
    callInDimensionUnreliable(){}
    callInRangeUnreliable(){}
    reloadResources(){}
    */

    get size() {
        return alt.getServerConfig().players;
    }
}

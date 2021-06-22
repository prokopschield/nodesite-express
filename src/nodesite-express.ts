import { getConfig } from 'doge-config';
import http from 'http';
import https from 'https';
import { NodeSiteRequest, ListenerResponse } from 'nodesite.eu';
import { listen, NSLocalOptions } from 'nodesite.eu-local';

const config = getConfig('nodesite-express');

type NodeSiteExpressCallback = (request: NodeSiteRequest, state?: ListenerResponse) => Promise<ListenerResponse>;

export class NodeSiteExpress {
	public static factory (opts: NSLocalOptions) {
		return new NodeSiteExpress(opts);
	}
	declare public create: (path: string, listener?: (req: NodeSiteRequest) => ListenerResponse | Promise<ListenerResponse>, file?: string) => any;
	declare public server: http.Server | https.Server;
	constructor (opts: NSLocalOptions) {
		Object.assign(this, listen(opts || {
			name: config.str.name,
			port: config.num.port,
			protocol: config.str.protocol,
			certificate: {
				cert: config.obj.certificate.str.cert,
				key: config.obj.certificate.str.key,
			}
		}));
	}
	listeners: {
		[path: string]: {
			[method: string]: Array<NodeSiteExpressCallback>;
		}
	} = {};
	set (method: string, path: string, callback: NodeSiteExpressCallback) {
		if (!this.listeners[path]) this.listeners[path] = {};
		if (!this.listeners[path][method]) this.listeners[path][method] = [];
		this.listeners[path][method].push(callback);
		this.create(path, async (req: NodeSiteRequest) => {
			if (!this.listeners[path][req.method]) {
				return `Cannot ${req.method} ${path}`;
			}
			let state: ListenerResponse | undefined = void null;
			for (const callback of this.listeners[path][req.method]) {
				state = (await callback(req, state)) || state;
			}
			return state || `Cannot ${req.method} ${path}`;
		});
	}
	get (path: string, callback: NodeSiteExpressCallback) {
		this.set('GET', path, callback);
	}
	head (path: string, callback: NodeSiteExpressCallback) {
		this.set('HEAD', path, callback);
	}
	post (path: string, callback: NodeSiteExpressCallback) {
		this.set('POST', path, callback);
	}
	put (path: string, callback: NodeSiteExpressCallback) {
		this.set('PUT', path, callback);
	}
	delete (path: string, callback: NodeSiteExpressCallback) {
		this.set('DELETE', path, callback);
	}
	connect (path: string, callback: NodeSiteExpressCallback) {
		this.set('CONNECT', path, callback);
	}
	options (path: string, callback: NodeSiteExpressCallback) {
		this.set('OPTIONS', path, callback);
	}
	trace (path: string, callback: NodeSiteExpressCallback) {
		this.set('TRACE', path, callback);
	}
	patch (path: string, callback: NodeSiteExpressCallback) {
		this.set('PATCH', path, callback);
	}
}

export default NodeSiteExpress.factory;
module.exports = NodeSiteExpress.factory;

Object.assign(NodeSiteExpress.factory, {
	default: NodeSiteExpress.factory,
	...NodeSiteExpress,
	NodeSiteExpress,
});

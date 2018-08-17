/**
 * Created by yuanjianxin on 2018/7/3.
 */
const grpc=require('grpc');
const messages=require('grpc-ws-service-pb').WebSocketService_pb;
const services=require('grpc-ws-service-pb').WebSocketService_grpc_pb;
module.exports=class _handler{

    static get instance(){
        if(!_handler._instance)
            _handler._instance=new _handler();
        return _handler._instance;
    }

    constructor(){
        this.host=null;
        this.port=null;
        this.pool=[];
        this.poolSize=5;
    }

    config({host,port,poolSize}){
        this.host=host;
        this.port=port;
        poolSize && (this.poolSize=poolSize);
        this.initClients();
    }

    initClients(){
        Array(this.poolSize).fill(null).forEach(v=>{
            this.pool.push(new services.WebSocketServiceClient(`${this.host}:${this.port}`,grpc.credentials.createInsecure()));
        })
    }

    get Client(){
        return this.pool.shift() || new services.WebSocketServiceClient(`${this.host}:${this.port}`,grpc.credentials.createInsecure());
    }

    getUriByUserId(userId){
        if(!userId)
            return null;
        let request=new messages.GetUriRequest();
        request.setUserid(userId.toString());
        let client=this.Client;
        return new Promise((resolve,reject)=>{
            client.getUriByUserId(request,(err,data)=>{
                this.pool.length<this.poolSize  && this.pool.push(client) || client.close();
                err ? reject(err) : resolve(data.getWsuri());
            })
        });
    }

    sendMessage(userId,message){
        !(userId instanceof Array) && (userId=[userId]);
        !(message instanceof Array) && (message=[message]);
        userId=JSON.stringify(userId);
        message=JSON.stringify(message);
        let request=new messages.sendMsgRequest();
        request.setUserid(userId);
        request.setMessage(message);
        let client=this.Client;
        return new Promise((resolve,reject)=>{
            client.sendMsg(request,(err,data)=>{
                this.pool.length<this.poolSize  && this.pool.push(client) || client.close();
                err ? reject(err) : resolve(data.getResult());
            });
        });
    }

    broadcast(message){
        message=JSON.stringify(message);
        let request=new messages.broadcastRequest();
        request.setMessage(message);
        let client=this.Client;
        return new Promise((resolve,reject)=>{
            client.broadcast(request,(err,data)=>{
                this.pool.length<this.poolSize  && this.pool.push(client) || client.close();
                err ? reject(err) : resolve(data.getResult());
            });
        });
    }

    isOnline(userId){
        if(!userId)
            return null;
        let request=new messages.checkExistRequest();
        request.setUserid(userId.toString());
        let client=this.Client;
        return new Promise((resolve,reject)=>{
            client.checkExist(request,(err,data)=>{
                this.pool.length<this.poolSize  && this.pool.push(client) || client.close();
                err ? reject(err) : resolve(data.getResult());
            });
        });
    }

};
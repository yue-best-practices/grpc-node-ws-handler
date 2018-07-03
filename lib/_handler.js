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
    }

    config({host,port}){
        this.host=host;
        this.port=port;
    }

    getUriByUserId(userId){
        if(!userId)
            return null;
        let request=new messages.GetUriRequest();
        request.setUserid(userId.toString());
        let client=new services.WebSocketServiceClient(`${this.host}:${this.port}`,grpc.credentials.createInsecure());
        return new Promise((resolve,reject)=>{
            client.getUriByUserId(request,(err,data)=>{
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
        let client=new services.WebSocketServiceClient(`${this.host}:${this.port}`,grpc.credentials.createInsecure());
        return new Promise((resolve,reject)=>{
            client.sendMsg(request,(err,data)=>{
                err ? reject(err) : resolve(data.getResult());
            });
        });
    }

    broadcast(message){
        message=JSON.stringify(message);
        let request=new messages.broadcastRequest();
        request.setMessage(message);
        let client=new services.WebSocketServiceClient(`${this.host}:${this.port}`,grpc.credentials.createInsecure());
        return new Promise((resolve,reject)=>{
            client.broadcast(request,(err,data)=>{
                err ? reject(err) : resolve(data.getResult());
            });
        });
    }

    isOnline(userId){
        if(!userId)
            return null;
        let request=new messages.checkExistRequest();
        request.setUserid(userId.toString());
        let client=new services.WebSocketServiceClient(`${this.host}:${this.port}`,grpc.credentials.createInsecure());
        return new Promise((resolve,reject)=>{
            client.checkExist(request,(err,data)=>{
                err ? reject(err) : resolve(data.getResult());
            });
        });
    }

};
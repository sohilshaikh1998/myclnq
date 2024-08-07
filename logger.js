import io from 'socket.io-client';

var socket=null;
const apikey = 'myclnq-requester-sandeep'
export default class logger {
    constructor(props){
        //super(props)
        // console.log("init_socket")
        // socket = io('http://localhost:8080',{
        //     query: {token:'xxx'}
        //   });
        // socket.on('connect', function(data){
        //     console.log("connect_socket",data)
        // });
    }
//192.168.0.107 //3.21.245.50
    static init(apikey){
        if(socket == null){
            socket = io('http://3.21.245.50:8080/',{
                query:{token:apikey}
            });
            socket.on(apikey, function(data){
                //console.log("connect_socket",data)
            });

            socket.on('disconnect',function(data){
                //console.log('disconnected_socket',data)
            })
        }
    }

    static getAxiosRequestConfig(config){
        let _config = config;
        _config.metadata = { startTime: new Date(), identifier:new Date().getTime()}
        return _config
    }

    static sendRequestMetrics(t, e) {
        try {
            let o = t;
            "fetch" != e ? ('apisauce' === e) ?
                o.url = o.config.baseURL + o.config.url : o
                    : o.duration = "Unidentified", o.type = e, socket.emit("logger", o, t => {
                //console.log(t)
            })
        } catch (t) {
            //console.log("Metrics_Error", t)
        }
    }
}
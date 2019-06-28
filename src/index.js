const express = require( 'express' )
const http	  = require( 'http' )
const socketio = require( 'socket.io' )
const Filter	= require( 'bad-words' )

const { generateMessage , generateLocationMessage} 			= require( './utils/messages' )
const { addUser , removeUser , getUser , getUsersInRoom } 	=  require( './utils/users')
const app  = express( )

const server = http.createServer( app )
const io = socketio( server )

app.use( express.static( 'public' ) )

io.on( 'connection' , ( socket )=>{
	console.log( 'New Connection' )
	

	
	socket.on( "sendMessage" , ( message , callback) =>{
		const filter = new Filter( )
		//console.log( message )

		const user = getUser( socket.id )

		if( filter.isProfane( message ) ){
			return callback( 'profane' )
		}
		io.to( user.room ).emit( 'message' , generateMessage( user.username ,  message ) )	
		callback( )
	})

	socket.on( "disconnect" , ( )=>{
		const { error , user } = removeUser( socket.id )
		
		if( user ){
			const users = getUsersInRoom( user.room )
			io.to( user.room ).emit('message' , generateMessage( user.username ,  `${user.username} has left` )  )
			io.to( user.room ).emit( 'roomData' , { username : user.username , room : user.room , users  })
		}
	})

	socket.on("sendLocation" , ( location , callback ) =>{
		let { latitude , longitude } = location
		const user = getUser( socket.id )
		io.to( user.room ).emit('locationMessage' , generateLocationMessage( user.username , `https://google.com/maps?q=${latitude},${longitude}` ) )
		callback() 
	})

	socket.on( "join" , ( queryParams , callback ) =>{

		const { error  , user } = addUser( { id : socket.id , ...queryParams } )

		if( error ){
			console.log("i;m rturn")
			return callback( { error } )
		}else{

			socket.join( user.room )

			users = getUsersInRoom( user.room )
			

			socket.emit( 'message' , generateMessage( user.username , 'welcome to our website' ) )
			socket.to( user.room ).broadcast.emit( 'message' , generateMessage( user.username  ,`${user.username} has joined` ) )
			io.to( user.room ).emit( 'roomData' , { users , room : user.room , username : user.username } )
			callback( undefined )
		}

	})

})

app.get( '/' , ( req , res ) =>{

	res.render( 'index.html' )
})

server.listen( 3000 , ( ) =>{
	console.log( 'Server is up...' )
})
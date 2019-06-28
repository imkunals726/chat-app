const users = []

const addUser = ( { id , username , room } ) =>{

	username 	= username.toLowerCase( ).trim() 
	room	   	= room.toLowerCase( ).trim( )

	if(!username || !room ){
		return {
			error : 'username and room are required and they cannot be blank'
		}
	}

	const existingUser = users.find( ( user ) => {
		return user.room === room && user.username === username
	} )

	if( existingUser ){
		return {
			error : 'User already Exists in this room'
		}
	}
	const user  = { id , username , room }
	users.push( user )

	return { user }
}


const removeUser = ( id ) =>{
	const index = users.findIndex( ( user ) => user.id === id )

	if( index === -1 ){
		return {
			error : 'Id not found '
		}
	}
	console.log( index )
	//console.log( users.splice( index , 1 ) )
	return { user : users.splice( index , 1 )[0]	}

}

const getUser = ( id ) =>{
	const index = users.findIndex( ( user ) => user.id === id )
	if( index === -1 ){
		return undefined
	}

	return users[ index ] 
}

const getUsersInRoom = ( room ) =>{
	room = room.toLowerCase( ).trim( )
	const usersInRoom = users.filter( ( user ) => user.room === room )

	return usersInRoom
}

module.exports = { addUser , removeUser , getUser , getUsersInRoom }


import React ,{ createContext, type ReactNode} from 'react'

interface AuthContextType{
  serverUrl:string
}

interface AuthProviderProps{
  children:ReactNode
}



export const authDataContext=createContext<AuthContextType|undefined>(undefined)

function AuthContext({children}:AuthProviderProps) {

    const serverUrl="http://localhost:8000"
    const value={
        serverUrl
    }
  return (
  <div>
      <authDataContext.Provider value={value}>
          { children}
      </authDataContext.Provider>
    </div>
  )
}

export default AuthContext


import React ,{ createContext, useState, type ReactNode} from 'react'

interface AuthContextType{
  serverUrl:string

}
interface AuthProviderProps{
  children:ReactNode
}

export const authDataContext=createContext<AuthContextType|undefined>(undefined)

function AuthContext({children}:AuthProviderProps) {

    const serverUrl="http://localhost:8000"
      const [authChecked, setAuthChecked] = useState(false)

    const value={
        serverUrl,
        authChecked,
        setAuthChecked
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

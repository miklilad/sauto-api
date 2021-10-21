import { CarData, ClientOptions, SautoHash, SautoResponse } from './types';
import xmlrpc from 'xmlrpc';
import md5 from 'md5';

const login = 'import'
const password = 'test'
const config = {
  "host": "import.sauto.cz",
  "port": 80,
  "path": "/RPC2"
};
const swKey = "testkey-571769"



export default class SautoApi {
  private _client: xmlrpc.Client
  private _login: string
  private _password: string
  private _swKey: string
  private _sessionId: string | undefined

  constructor(config: ClientOptions, login: string, password: string, swKey: string) {
    this._client = xmlrpc.createClient(config)
    this._login = login
    this._password = password
    this._swKey = swKey
    this._sessionId = undefined
  }

  private _getHash(): Promise<SautoHash> {
    return new Promise((resolve, reject) =>
      this._client.methodCall('getHash', [this._login], (err, res) => {
        if (err) reject(err.toString())
        if (res.status >= 400) reject(res.status_message)
        resolve(res)
      }))
  }

  private _checkLogin() {
    if (!this._sessionId) throw new Error('Invalid login!')
  }

  async login(): Promise<SautoResponse> {
    const hashPair = await this._getHash()
    const { hash_key, session_id } = hashPair.output
    const hashedPassword = md5(md5(this._password) + hash_key)

    return new Promise((resolve, reject) =>
      this._client.methodCall('login', [session_id, hashedPassword, this._swKey], (err, res) => {
        if (err) reject(err.toString())
        if (res.status >= 400) reject(res.status_message)
        this._sessionId = session_id
        resolve(res)
      }))
  }

  logout(): Promise<SautoResponse> {
    this._checkLogin()
    return new Promise((resolve, reject) =>
      this._client.methodCall('logout', [this._sessionId], (err, res) => {
        if (err) reject(err.toString())
        if (res.status >= 400) reject(res.status_message)
        resolve(res)
      }))
  }

  addEditCar(carData: CarData) {
    this._checkLogin()
    
  }
}

(async () => {
  const api = new SautoApi(config, login, password, swKey)
  try {
    await api.login()
    const res = await api.logout()
    console.log(res)
  } catch (err) {
    console.log(err)
  }
})()

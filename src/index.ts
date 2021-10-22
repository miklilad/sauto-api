import { ClientOptions, SautoHash, SautoResponse } from './types';
import xmlrpc from 'xmlrpc';
import md5 from 'md5';

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

  private _checkLogin() {
    if (!this._sessionId) throw new Error('You must login before using API!')
  }

  private _sautoCall(functionName: string, args: any[]): Promise<any> {
    return new Promise((resolve, reject) =>
      this._client.methodCall(functionName, args, (err, res) => {
        if (err) reject(err.toString())
        if (res.status >= 400) reject(res.status_message)
        resolve(res)
      }))
  }

  private _getHash(): Promise<SautoHash> {
    return this._sautoCall('getHash', [this._login])
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

  version(): Promise<string> {
    return this._sautoCall('version', [])
      .then(res => res.output?.version)
  }

  logout(): Promise<SautoResponse> {
    this._checkLogin()
    return this._sautoCall('logout', [this._sessionId])
  }

  addEditCar(carData: Object): Promise<any> {
    this._checkLogin()
    return this._sautoCall('addEditCar', [this._sessionId, carData])
  }

  getCar(carId: number) {
    this._checkLogin()
    return this._sautoCall('getCar', [this._sessionId, carId])
  }

  getCarId(customId: string) {
    this._checkLogin()
    return this._sautoCall('getCarId', [this._sessionId, customId])
  }

  delCar(carId: number) {
    this._checkLogin()
    return this._sautoCall('delCar', [this._sessionId, carId])
  }

  listOfCars(imported?: string) {
    this._checkLogin()
    return this._sautoCall('listOfCars', [this._sessionId, imported])
  }

  topCars(carIds: number[]) {
    this._checkLogin()
    return this._sautoCall('topCars', [this._sessionId, carIds])
  }

  addEditPhoto(carId: number, photoData: Object) {
    this._checkLogin()
    return this._sautoCall('addEditPhoto', [this._sessionId, carId, photoData])
  }

  delPhoto(photoId: number) {
    this._checkLogin()
    return this._sautoCall('delPhoto', [this._sessionId, photoId])
  }

  getPhotoId(carId: number, clientPhotoId: string) {
    this._checkLogin()
    return this._sautoCall('getPhotoId', [this._sessionId, carId, clientPhotoId])
  }

  listOfPhotos(carId: number) {
    this._checkLogin()
    return this._sautoCall('listOfPhotos', [this._sessionId, carId])
  }

  addEquipment(carId: number, equipment: number[]) {
    this._checkLogin()
    return this._sautoCall('addEquipment', [this._sessionId, carId, equipment])
  }

  listOfEquipment(carId: number) {
    this._checkLogin()
    return this._sautoCall('listOfEquipment', [this._sessionId, carId])
  }

  addVideo(carId: number, videoData: Object) {
    this._checkLogin()
    return this._sautoCall('addVideo', [this._sessionId, carId, videoData])
  }

  delVideo(carId: number) {
    this._checkLogin()
    return this._sautoCall('delVideo', [this._sessionId, carId])
  }

  getReplies(filters: Object, offset: number, limit: number) {
    this._checkLogin()
    return this._sautoCall('getReplies', [this._sessionId, filters, offset, limit])
  }
}

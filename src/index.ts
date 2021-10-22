import { ClientOptions, SautoHash, SautoResponse } from './types';
import xmlrpc from 'xmlrpc';
import md5 from 'md5';

const log = async (res) => {console.log(res); return res}


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
    .then(res => res.output).then(log)
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
    .then(res => Object.values(res.output?.list_of_cars || {}))
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

// var login = 'import',
//   password = 'test',
//   swKey = 'testkey-571769',
//   config = {
//     "host": "import.sauto.cz",
//     "port": 80,
//     "path": "/RPC2"
//   };

const car = {
  custom_id: '1234',
  kind_id: 1,
  manufacturer_id: 93,
  model_id: 708,
  body_id: 6,
  car_status: 1,
  vin: 'YS3FH56U671259941',
  state_id: 10,
  fuel: 1,
  tachometr: 10,
  tachometr_unit: 1,
  condition: 1,
  price: 759000,
  engine_volume: 1968,
  dph: 1,
  vat_deductable: 1,
  engine_power: 103,
  color: 1,
  color_type: 1,
  euro: 5,
  handicaped: 0,
  tunning: 0,
  crashed: 0,
  airbag: 7,
  aircondition: 4,
  gearbox: 1,
  gearbox_level: 6,
  doors: 5,
  capacity: 5,
  note: 'The reference data helps you to find feasible values for our enum or set datatypes.',
  type_info: 'Combi Outdoor 2.0 TDI 4x4',
  price_notice: 'AKCE!!! Nový vůz na objednávku, dodání do 12 týdnů. Model: Ambition Možnost záruky až na 5 let bez omezení km.',
  description: 'Design Outdoor: dekorativní ochranné prvky ve spodní části vozidla, ochranné lišty kolem předních a zadních blatníků, ochranné prvky na předním a zadním nárazníku.',
  made_date: '2014-03',
  run_date: '2014-03'
};

// (async () => {
//   const api = new SautoApi(config, login, password, swKey)
//   await api.login()
//   const res = await api.addEditCar(car)
//   await api.logout()
//   console.log(res)
// })()

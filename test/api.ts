import SautoApi from '../src/index'
import { expect } from 'chai'
//import fs from 'fs';

var login = 'import',
  password = 'test',
  swKey = 'testkey-571769',
  config = {
    "host": "import.sauto.cz",
    "port": 80,
    "path": "/RPC2"
  };

var api = new SautoApi(config, login, password, swKey);

describe('Sauto API tests', function () {

  this.timeout(10000);


  describe('without login', function () {

    it('should print version', function () {

      api
        .version()
        .then(function (version) {
          expect(version).to.be.a('string');
        })
    });


    it('should login and logout', function () {

      api
        .login()
        .then(function () {
          return api.logout()
        })
    });

  });

  describe('logged', function () {

    before(async function () {
      return api
        .login()
    })
    after(async function () {
      return api
        .logout()
    });


    it('should get list of cars', function () {
      api
        .listOfCars()
        .then(function (ids) {
          expect(ids).to.be.instanceOf(Array);
        })
    });


    // TODO: implement...

    describe('car manipulation', function () {

      var carId,
        car = require(__dirname + '/data/car.js'),
        equips = [3, 4, 5, 6, 7, 8];

      before(function () {

        api
          .addEditCar(car)
          .then(function (result) {
            expect(result.error).to.be.false;
            expect(result.id).to.be.a('number');
            carId = parseInt(result.id);
          })
      });


      after(function () {

        api
          .delCar(carId)
      });


      it('should get a car', function () {

        api
          .getCar(carId)
          .then(function (result) {
            expect(result).to.be.an('Object');
          })
      });


      it('should edit car', function () {

        car.car_id = carId;

        api
          .addEditCar(car)
          .then(function (result) {
            expect(result.error).to.be.false;
            expect(result.id).to.be.a('number');
          })
      });


      it('should get car id', function () {
        var car = require(__dirname + '/data/car.js');

        api
          .getCarId(car.custom_id)
          .then(function (result) {
            expect(result).to.be.equal(carId);
          })
      });


      it('should add equipment', function () {

        api
          .addEquipment(carId, equips)
      });


      it('should get list of equipment', function () {

        api
          .listOfEquipment(carId)
          .then(function (result) {
            expect(result).to.be.an('Array');
          })
      });


      it('should insert new car with errors', function () {

        delete car.vin;
        delete car.custom_id;
        delete car.kind_id;
        delete car.brand_id;
        delete car.model_id;
        delete car.manufacturer_id;

        api
          .addEditCar({})
          .catch(function (err) {
            expect(err.error).to.be.eql('Auto s neuplnym kind_id, manufacturer_id, model_id a body_id');
            expect(err.id).to.be.undefined;
          })
      });


      // describe('small photos manipulation', function () {

      //   var images = ['1.jpg', '2.jpg', '3.jpg'];

      //   it('should fail', function (done) {

      //     var photos = [];

      //     images.forEach(function (img, i) {

      //       var content = fs.readFileSync(__dirname + '/data/' + img);

      //       var base64Image = new Buffer(content, 'binary').toString('base64');

      //       photos.push({
      //         b64: new Buffer(base64Image, 'base64'),
      //         client_photo_id: img,
      //         main: i
      //       });
      //     });


      //     async.each(photos, function (photo, callback) {

      //       api
      //         .addEditPhoto(carId, photo)
      //         .catch(function (err) {
      //           expect(err.error).to.eql('Fotografie je v malem rozliseni');
      //           callback();
      //         })
      //         .done();

      //     }, done);

      //   });

      // })


      // describe('photo manipulation', function () {

      //   var images = ['1_big.jpg', '2_big.jpg', '3_big.jpg'];

      //   before(function (done) {

      //     var photos = [];

      //     images.forEach(function (img, i) {

      //       var content = fs.readFileSync(__dirname + '/data/' + img);

      //       var base64Image = new Buffer(content, 'binary').toString('base64');

      //       photos.push({
      //         b64: new Buffer(base64Image, 'base64'),
      //         client_photo_id: img,
      //         main: i
      //       });
      //     });


      //     async.each(photos, function (photo, callback) {

      //       api
      //         .addEditPhoto(carId, photo)
      //         .then(function (result) {
      //           callback();
      //         }, callback)
      //         .done();

      //     }, done);

      //   });


      //   it('should get list of photos', function () {

      //     api
      //       .listOfPhotos(carId)
      //       .then(function (result) {
      //         expect(result).to.be.an('Array');
      //       })
      //   });


      //   it('should get photo id', function () {

      //     api
      //       .getPhotoId(carId, images[0])
      //       .then(function (result) {
      //         expect(result).to.be.a('number');
      //       })
      //   });


      //   describe('delete photo', function () {

      //     var photoId;

      //     before('should get photo id', function () {

      //       api
      //         .getPhotoId(carId, images[0])
      //         .then(function (result) {
      //           photoId = result;
      //         })
      //     });


      //     it('should delete photo', function () {

      //       api
      //         .delPhoto(photoId)
      //     });

      //   });
      // });
    });


  });


});


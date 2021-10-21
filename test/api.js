var SautoApi = require('../dist'),
  expect = require('chai').expect,
  async = require('async'),
  fs = require('fs');


var login = 'import',
  password = 'test',
  swKey = 'testkey-571769',
  config = {
    "connection" : {
      "host": "import.sauto.cz",
        "port": 80,
        "path": "/RPC2"
    }
  };

var api = new SautoApi(config, login, password, swKey);

describe('Sauto API tests', function() {

  this.timeout(10000);


  describe('without login', function() {

    it('should print version', function(done) {

      api
        .version()
        .then(function(version) {
          expect(version).to.be.a('string');
          done();
        }, done)
        .done();
    });


    it('should login and logout', function(done) {

      api
        .login()
        .then(function() {
          return api.logout()
        })
        .then(function() {
          done();
        }, done)
        .done();
    });

  });

  describe('logged', function() {

    before(function(done) {
      api
        .login()
        .then(function() {
          done();
        }, done)
        .done();
    });

    after(function(done) {
      api
        .logout()
        .then(function() {
          done();
        }, done)
        .done();
    });


    it('should get list of cars', function(done) {
      api
        .listOfCars()
        .then(function(ids) {
          expect(ids).to.be.instanceOf(Array);
          done();
        }, done)
        .done();
    });


    // TODO: implement...

    describe('car manipulation', function() {

      var carId,
        car = require(__dirname + '/data/car.js'),
        equips = [3, 4, 5, 6, 7, 8];

      before(function(done) {

        api
          .addEditCar(car)
          .then(function(result) {
            expect(result.error).to.be.false;
            expect(result.id).to.be.a('number');
            carId = parseInt(result.id);
            done();
          }, done)
          .done();
      });


      after(function(done) {

        api
          .delCar(carId)
          .then(function(result) {
            done();
          }, done)
          .done();
      });


      it('should get a car', function(done) {

        api
          .getCar(carId)
          .then(function(result) {
            expect(result).to.be.an('Object');
            done();
          }, done)
          .done();
      });


      it('should edit car', function(done) {

        car.car_id = carId;

        api
          .addEditCar(car)
          .then(function(result) {
            expect(result.error).to.be.false;
            expect(result.id).to.be.a('number');
            done();
          }, done)
          .done();
      });


      it('should get car id', function(done) {
        var car = require(__dirname + '/data/car.js');

        api
          .getCarId(car.custom_id)
          .then(function(result) {
            expect(result).to.be.equal(carId);
            done();
          }, done)
          .done();
      });


      it('should add equipment', function(done) {

        api
          .addEquipment(carId, equips)
          .then(function(result) {
            done();
          }, done)
          .done();
      });


      it('should get list of equipment', function(done) {

        api
          .listOfEquipment(carId)
          .then(function(result) {
            expect(result).to.be.an('Array');
            done();
          }, done)
          .done();
      });


      it('should insert new car with errors', function(done) {

        delete car.vin;
        delete car.custom_id;
        delete car.kind_id;
        delete car.brand_id;
        delete car.model_id;
        delete car.manufacturer_id;

        api
          .addEditCar({})
          .catch(function(err) {
            expect(err.error).to.be.eql('Auto s neuplnym kind_id, manufacturer_id, model_id a body_id');
            expect(err.id).to.be.undefined;
            done();
          })
          .done();
      });


      describe('small photos manipulation', function() {

        var images = ['1.jpg', '2.jpg', '3.jpg'];

        it('should fail', function(done) {

          var photos = [];

          images.forEach(function(img, i) {

            var content = fs.readFileSync(__dirname + '/data/' + img);

            var base64Image = new Buffer(content, 'binary').toString('base64');

            photos.push({
              b64: new Buffer(base64Image, 'base64'),
              client_photo_id: img,
              main: i
            });
          });


          async.each(photos, function(photo, callback) {

            api
              .addEditPhoto(carId, photo)
              .catch(function(err) {
                expect(err.error).to.eql('Fotografie je v malem rozliseni');
                callback();
              })
              .done();

          }, done);

        });

      })


      describe('photo manipulation', function() {

        var images = ['1_big.jpg', '2_big.jpg', '3_big.jpg'];

        before(function(done) {

          var photos = [];

          images.forEach(function(img, i) {

            var content = fs.readFileSync(__dirname + '/data/' + img);

            var base64Image = new Buffer(content, 'binary').toString('base64');

            photos.push({
              b64: new Buffer(base64Image, 'base64'),
              client_photo_id: img,
              main: i
            });
          });


          async.each(photos, function(photo, callback) {

            api
              .addEditPhoto(carId, photo)
              .then(function(result) {
                callback();
              }, callback)
              .done();

          }, done);

        });


        it('should get list of photos', function(done) {

          api
            .listOfPhotos(carId)
            .then(function(result) {
              expect(result).to.be.an('Array');
              done();
            }, done)
            .done();
        });


        it('should get photo id', function(done) {

          api
            .getPhotoId(carId, images[0])
            .then(function(result) {
              expect(result).to.be.a('number');
              done();
            }, done)
            .done();
        });


        describe('delete photo', function() {

          var photoId;

          before('should get photo id', function(done) {

            api
              .getPhotoId(carId, images[0])
              .then(function(result) {
                photoId = result;
                done();
              }, done)
              .done();
          });


          it('should delete photo', function(done) {

            api
              .delPhoto(photoId)
              .then(function(result) {
                done();
              }, done)
              .done();
          });

        });
      });
    });



    it('should add video');
    it('should delete video');



  });


});


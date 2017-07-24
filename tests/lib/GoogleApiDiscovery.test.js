import chai from 'chai';
import { ApiDirectory, GoogleApiDiscovery } from '../../client/scripts/lib/GoogleApiDiscovery';

// import { app } from '../app/app';

// Chai add-ons
// chai.use(require('chai-as-promised'));
// chai.use(require('chai-json-schema'));
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

// Chance
// const chance = new Chance();

describe('Test GoogleApiDiscovery', function() {

  it('it should create a new GoogleApiDiscovery instance', done => {
    const apiDirectory = new ApiDirectory();
    console.log(apiDirectory);
    return done()
  })

})

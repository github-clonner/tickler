import chai from 'chai';
import axios from 'axios';
import { URL, URLSearchParams } from 'url';
import { ApiDirectory, GoogleApiDiscovery } from '../../client/scripts/lib/GoogleApiDiscovery';

const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const DIRECTORY_SERVICE = {
  name: 'directory',
  version: 'v1'
};

describe('Test GoogleApiDiscovery', function() {

  before (function (done) {
    const apiDirectory = new ApiDirectory();
    const description = apiDirectory.getRest(DIRECTORY_SERVICE);
    console.log(description);
    return done();
  });

  it('it should get discovery service url', function (done) {
    const directory = new ApiDirectory();
    console.log(discovery.urlXXX)
    const url = new URL(directory.url);

    expect(url)
      .to.be.an.instanceof(URL);
    expect(url.href)
      .to.be.a('string')
      .and.to.equal('https://www.googleapis.com/discovery/v1/apis');
    expect(url.protocol)
      .to.be.a('string')
      .and.to.equal('https:');      
    expect(url.hostname)
      .to.be.a('string')
      .and.to.equal('www.googleapis.com');
    expect(url.pathname)
      .to.be.a('string')
      .and.to.equal('/discovery/v1/apis');

    return done();
  });

  /*
  it('it should retrieve the list of APIs supported', function (done) {
    const apiDirectory = new ApiDirectory();
    apiDirectory
    .list()
    .then(list => {
      console.log(Object.keys(list));
      return done();
    })
    .catch(done);
  });
  */

  /*
  it('should retrieve the description of a particular version of an API', function (done) {

  });
  */
})

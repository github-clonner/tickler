import chai from 'chai';
import safe, { either, Undefined, isUndefined } from '../../client/scripts/lib/safeobj';

const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;


const getFatherName = function (person) {
  return person.father.name;
}

const getName = function (person) {
  return person.name;
}

describe('safe', function () {

  it('should make access to unknown properties safe', () => {
    const safeDarthVader = safe({
      name : 'Anakin',
      mother : {
        name : 'Shmi'
      }
    });
    const darthVadersFather = either(getFatherName(safeDarthVader), `${getName(safeDarthVader)} has no father`);
    expect(darthVadersFather)
      .to.be.a('string')
      .and.to.equal('Anakin has no father');
  });

  it('should return Undefined when an undefined property is encountered', () => {
    const safeDarthVader = safe({
      name : 'Anakin',
      mother : {
        name : 'Shmi'
      }
    });
    expect(getFatherName(safeDarthVader))
      .to.be.an('object')
      .and.to.equal(Undefined);
  });

});

describe('Undefined', function () {

  it('is a proxy which returns itself on every property', () => {
    expect(Undefined.asd)
      .to.be.an('object')
      .and.to.equal(Undefined);
    expect(Undefined.asd.dfg)
      .to.be.an('object')
      .and.to.equal(Undefined);
    expect(Undefined.asd.dfg.zxxcv)
      .to.be.an('object')
      .and.to.equal(Undefined);
  });

  it('has an isUndefined method which checks its argument to see if it is the Undefined constant', () => {
    expect(isUndefined(Undefined))
      .to.equal(true);
    expect(isUndefined(undefined))
      .to.equal(false);
    expect(isUndefined({}))
      .to.equal(false);
  });

});

describe('either', function () {
  it('is a function which returns the first argument, unless thats an Undefined, in which case it returns the second', () => {
    expect(either('hi','there'))
      .to.be.a('string')
      .and.to.equal('hi');
    expect(either(Undefined,'there'))
      .to.be.a('string')
      .and.to.equal('there');
  });
});

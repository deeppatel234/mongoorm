const AbstractField = require('../../lib/fields/AbstractField');

describe('AbstractField', () => {
  class MyField extends AbstractField {
    constructor(props) {
      super(props);
      this.key = 'MyField';
    }

    getDefaultProps() {
      return {
        helloProp: 'newHello',
        worldProp: 'World',
      };
    }

    validateType() {
      return true;
    }
  }

  describe('default props test', () => {
    test('default props set in field props', async () => {
      let myField = new MyField({ helloProp: 'Hello' });
      await expect(myField.props).toEqual({ helloProp: 'Hello', worldProp: 'World' });
    });
  });

  describe('required props test', () => {
    class MyProp extends AbstractField {
      getRequiredProps() {
        return ['myprop'];
      }
    }

    test('should throw myprop not defined error', () => {
      expect(() => new MyProp()).toThrowError('myprop is not defined');
    });

    test('should not throw myprop not defined error', () => {
      expect(() => new MyProp({ myprop: true })).toBeDefined();
    });
  });

  describe('default value test', () => {
    test('default static test', () => {
      let myField = new MyField({ defaultValue: 'Hello' });
      expect(myField.get()).toBe('Hello');
      myField.set('World');
      expect(myField.get()).toBe('World');
    });

    test('default function test', () => {
      let myField = new MyField({ defaultValue: () => 'Hello' });
      expect(myField.get()).toBe('Hello');
      myField.set('World');
      expect(myField.get()).toBe('World');
    });
  });

  describe('setKey test', () => {
    test('should set field key when method called', async () => {
      let myField = new MyField({ helloProp: 'Hello' });
      myField.setKey('HelloField');
      expect(myField.key).toBe('HelloField');
    });
  });

  describe('getProps field test', () => {
    test('getProps with no param', () => {
      let myField = new MyField({ three: 3 });
      expect(myField.getProps()).toEqual({
        helloProp: 'newHello',
        worldProp: 'World',
        three: 3,
      });
    });

    test('getProps with string param', () => {
      let myField = new MyField({ three: 3 });
      expect(myField.getProps('three')).toBe(3);
    });

    test('getProps with list param', () => {
      let myField = new MyField({ three: 3 });
      expect(myField.getProps(['three'])).toEqual({ three: 3 });
    });
  });

  /*
   * =====================
   *  Setter Test Start
   * ======================
   */

  describe('setters test', () => {
    const doubleSetter = { prop: 'double', func: (prop, value) => value * 2 };
    const tripleSetter = { prop: 'triple', func: (prop, value) => value * 3 };

    test('test double setter', () => {
      let myField = new MyField({ double: true, setter: doubleSetter });
      myField.set(4);
      expect(myField.get()).toBe(8);
    });

    test('double setter not call when no value passed', () => {
      let myField = new MyField({ double: true, setter: doubleSetter });
      expect(myField.get()).toBe(undefined);
    });

    test('register setters in field', () => {
      let myField = new MyField({ double: true, setter: doubleSetter });
      myField.setSetter({});
      expect(myField.setAttrs.length).toBe(2);
      myField.setSetter([{}, {}]);
      expect(myField.setAttrs.length).toBe(4);
    });

    test('test triple setter', () => {
      let myField = new MyField({ triple: true, setter: tripleSetter });
      myField.set(3);
      expect(myField.get()).toBe(9);
    });
  });

  /*
   * =====================
   *  Setter Test End
   * ======================
   */

  describe('modified field test', () => {
    test('modified when init fields', () => {
      let myField = new MyField();
      expect(myField.isModified).toBeFalsy();
    });

    test('modified when set fields', () => {
      let myField = new MyField();
      myField.set(9);
      expect(myField.isModified).toBeTruthy();
    });
  });

  describe('beforeInit function test', () => {
    let steps = [];
    class MyProp extends AbstractField {
      constructor(props) {
        steps.push(1);
        super(props);
        steps.push(3);
      }

      beforeInit() {
        steps.push(2);
        return super.beforeInit();
      }
    }

    test('should call beforeInit method before child class constructor', () => {
      const myProp = new MyProp();
      myProp.set(9);
      expect(steps).toEqual([1, 2, 3]);
    });
  });

  /*
   * =====================
   *  Validator Test Start
   * ======================
   */

  describe('validator test', () => {
    test('test four validator', async () => {
      let myField = new MyField({ four: true, validator: { prop: 'four', func: (prop, value) => value === 4, message: '{KEY} should be 4 not {VAL}' } });
      myField.set(10);
      await expect(myField.validate()).rejects.toThrow('MyField should be 4 not true');
      myField.set(4);
      await expect(myField.validate()).resolves.toBeDefined();
    });

    test('register validator in field', () => {
      let myField = new MyField();
      myField.setValidator({});
      expect(myField.validateAttrs.length).toBe(1);
      myField.setValidator([{}, {}]);
      expect(myField.validateAttrs.length).toBe(3);
      myField.setValidator();
      expect(myField.validateAttrs.length).toBe(3);
    });

    test('async validator', async () => {
      let myField = new MyField({ five: true, validator: { prop: 'five', func: (prop, value) => (value === 5 ? Promise.resolve() : Promise.reject()), message: '{KEY} should be 5 not {VAL}' } });
      myField.set(11);
      await expect(myField.validate()).rejects.toThrow('MyField should be 5 not true');
      myField.set(5);
      await expect(myField.validate()).resolves.toBeDefined();
    });
  });

  describe('required property', () => {
    test('basic required test', async () => {
      let myField = new MyField({ required: true });
      await expect(myField.validate()).rejects.toThrow('MyField is required fields');
      myField.set(123);
      await expect(myField.validate()).resolves.toBe();
    });
  });

  describe('validateType field test', () => {
    test('validateType with UnimplementedMethod error', () => {
      class ValidateTypeField extends AbstractField {}
      const validateTypeField = new ValidateTypeField();
      validateTypeField.set(1);
      expect(() => validateTypeField.validate()).toThrow('validateType is not implemented');
    });
  });

  /*
  * =====================
  *  Validator Test End
  * ======================
  */
});

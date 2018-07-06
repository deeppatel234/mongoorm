const AbstractFields = require('../../lib/fields/AbstractFields');

describe('AbstractFields', () => {
  class MyFields extends AbstractFields {
    constructor(props) {
      super(props);
      this.type = 'string';
      this.fieldName = 'MyField';
      this.setSetter([{ prop: 'double', func: (prop, value) => value * 2 }]);

      this.setValidator([{ prop: 'three', func: (prop, value) => value === 3, message: '{KEY} should be 3 not {VAL}' }]);
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
      let myField = new MyFields({ helloProp: 'Hello' });
      await expect(myField.props).toEqual({ helloProp: 'Hello', worldProp: 'World' });
    });
  });

  describe('required props test', () => {
    class MyProp extends AbstractFields {
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

  describe('beforeInit function test', () => {
    let steps = [];
    class MyProp extends AbstractFields {
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
      new MyProp();
      expect(steps).toEqual([1, 2, 3]);
    });
  });

  describe('setFieldName test', () => {
    test('should set field name when method called', async () => {
      let myField = new MyFields({ helloProp: 'Hello' });
      myField.setFieldName('HelloField');
      expect(myField.fieldName).toBe('HelloField');
    });
  });

  /* =====================
      Validator Test
    ====================== */

  describe('validator test', () => {
    test('test four validator', async () => {
      let myField = new MyFields({ four: true, validator: { prop: 'four', func: (prop, value) => value === 4, message: '{KEY} should be 4 not {VAL}' } });
      myField.set(10);
      await expect(myField.validate()).rejects.toThrow('MyField should be 4 not true');
      myField.set(4);
      await expect(myField.validate()).resolves.toBe();
    });

    test('test three validator', async () => {
      let myField = new MyFields({ three: true });
      myField.set(9);
      await expect(myField.validate()).rejects.toThrow('MyField should be 3 not true');
      myField.set(3);
      await expect(myField.validate()).resolves.toBe();
    });

    test('register validator in field', () => {
      let myField = new MyFields();
      myField.setValidator({});
      expect(myField.validateAttrs.length).toBe(2);
      myField.setValidator([{}, {}]);
      expect(myField.validateAttrs.length).toBe(4);
    });

    test('async validator', async () => {
      let myField = new MyFields({ five: true, validator: { prop: 'five', func: (prop, value) => (value === 5 ? Promise.resolve() : Promise.reject()), message: '{KEY} should be 5 not {VAL}' } });
      myField.set(11);
      await expect(myField.validate()).rejects.toThrow('MyField should be 5 not true');
      myField.set(5);
      await expect(myField.validate()).resolves.toBe();
    });
  });

  /* =====================
      Setter Test
    ====================== */

  describe('setters test', () => {
    test('test double setter', () => {
      let myField = new MyFields({ double: true });
      myField.set(4);
      expect(myField.get()).toBe(8);
    });

    test('double setter not call when no value passed', () => {
      let myField = new MyFields({ double: true });
      expect(myField.get()).toBe(undefined);
    });

    test('register setters in field', () => {
      let myField = new MyFields({ double: true });
      myField.setSetter({});
      expect(myField.setAttrs.length).toBe(2);
      myField.setSetter([{}, {}]);
      expect(myField.setAttrs.length).toBe(4);
    });

    test('test triple setter', () => {
      let myField = new MyFields({ triple: true, setter: { prop: 'triple', func: (prop, value) => value * 3 } });
      myField.set(3);
      expect(myField.get()).toBe(9);
    });
  });

  describe('required property', () => {
    test('basic required test', async () => {
      let myField = new MyFields({ required: true });
      await expect(myField.validate()).rejects.toThrow('MyField is required fields');
      myField.set(123);
      await expect(myField.validate()).resolves.toBe();
    });
  });

  describe('default property', () => {
    test('default test', () => {
      let myField = new MyFields({ default: 'Hello' });
      expect(myField.get()).toBe('Hello');
      myField.set('World');
      expect(myField.get()).toBe('World');
    });

    test('default function test', () => {
      let myField = new MyFields({ default: () => 'Hello' });
      expect(myField.get()).toBe('Hello');
      myField.set('World');
      expect(myField.get()).toBe('World');
    });
  });

  describe('modified field test', () => {
    test('modified when init fields', () => {
      let myField = new MyFields({ three: true });
      myField.initValue(9);
      expect(myField.isModified).toBeTruthy();
    });

    test('modified when set fields', () => {
      let myField = new MyFields({ three: true });
      myField.set(9);
      expect(myField.isModified).toBeTruthy();
    });
  });

  describe('getProps field test', () => {
    test('getProps with no param', () => {
      let myField = new MyFields({ three: true });
      expect(myField.getProps()).toEqual({
        helloProp: 'newHello',
        worldProp: 'World',
        three: true,
      });
    });

    test('getProps with string param', () => {
      let myField = new MyFields({ three: true });
      expect(myField.getProps('three')).toBe(true);
    });

    test('getProps with list param', () => {
      let myField = new MyFields({ three: true });
      expect(myField.getProps(['three'])).toEqual({ three: true });
    });
  });

  describe('validateType field test', () => {
    test('validateType with UnimplementedMethod error', () => {
      class ValidateTypeField extends AbstractFields {}
      const validateTypeField = new ValidateTypeField();
      validateTypeField.set(1);
      expect(() => validateTypeField.validate()).toThrow('Validate type is not implemented');
    });
  });
});

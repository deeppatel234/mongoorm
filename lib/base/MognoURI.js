/**
 *   Used MongoLAB Mongo URI
 *   Github: https://github.com/mongolab/mongodb-uri-node
 */

class MognoURI {
  /**
   * Takes a URI of the form:
   *
   *   mongodb://[username[:password]@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database]][?options]
   *
   * and returns an object of the form:
   *
   *   {
   *     scheme: !String,
   *     username: String=,
   *     password: String=,
   *     hosts: [ { host: !String, port: Number= }, ... ],
   *     database: String=,
   *     options: Object=
   *   }
   *
   * scheme and hosts will always be present. Other fields will only be present
   * in the result if they were present in the input.
   *
   * @param {!String} uri
   * @return {Object}
   */
  parseString(uri) {
    let uriObject = {};

    let i = uri.indexOf('://');
    if (i < 0) {
      throw new Error(`No scheme found in URI ${uri}`);
    }
    uriObject.scheme = uri.substring(0, i);
    if (uriObject.scheme !== 'mongodb') {
      throw new Error('URI must begin with mongodb://');
    }
    let rest = uri.substring(i + 3);

    i = rest.indexOf('@');
    if (i >= 0) {
      let credentials = rest.substring(0, i);
      rest = rest.substring(i + 1);
      i = credentials.indexOf(':');
      if (i >= 0) {
        uriObject.username = decodeURIComponent(credentials.substring(0, i));
        uriObject.password = decodeURIComponent(credentials.substring(i + 1));
      } else {
        uriObject.username = decodeURIComponent(credentials);
      }
    }

    i = rest.indexOf('?');
    if (i >= 0) {
      let options = rest.substring(i + 1);
      rest = rest.substring(0, i);
      uriObject.options = {};
      options.split('&').forEach(function (o) {
        let iEquals = o.indexOf('=');
        uriObject.options[decodeURIComponent(o.substring(0, iEquals))] =
              decodeURIComponent(o.substring(iEquals + 1));
      });
    }

    i = rest.indexOf('/');
    if (i >= 0) {
      // Make sure the database name isn't the empty string
      if (i < rest.length - 1) {
        uriObject.database = decodeURIComponent(rest.substring(i + 1));
      }
      rest = rest.substring(0, i);
    }

    this._parseAddress(rest, uriObject);

    return uriObject;
  }
  /**
   * Parses the address into the uriObject, mutating it.
   *
   * @param {!String} address
   * @param {!Object} uriObject
   * @private
   */
  _parseAddress(address, uriObject) {
    uriObject.hosts = [];
    address.split(',').forEach(function (h) {
      let i = h.indexOf(':');
      if (i >= 0) {
        uriObject.hosts.push({
          host: decodeURIComponent(h.substring(0, i)),
          port: parseInt(h.substring(i + 1), 10),
        });
      } else {
        uriObject.hosts.push({ host: decodeURIComponent(h) });
      }
    });
  }
  /**
   * Takes a URI object and returns a URI string of the form:
   *
   *   mongodb://[username[:password]@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database]][?options]
   *
   * @param {Object=} uriObject
   * @return {String}
   */
  parseObject(uriObject) {
    if (!uriObject) {
      return 'mongodb://localhost';
    }

    let uri = 'mongodb://';

    if (uriObject.username) {
      uri += encodeURIComponent(uriObject.username);
      if (uriObject.password) {
        uri += `:${encodeURIComponent(uriObject.password)}`;
      }
      uri += '@';
    }

    uri += this._formatAddress(uriObject);

    if (uriObject.database) {
      uri += `/${encodeURIComponent(uriObject.database)}`;
    }

    if (uriObject.options) {
      Object.keys(uriObject.options).forEach(function (k, i) {
        uri += i === 0 ? '?' : '&';
        uri += `${encodeURIComponent(k)}=${encodeURIComponent(uriObject.options[k])}`;
      });
    }
    return uri;
  }
  /**
   * Formats the address portion of the uriObject, returning it.
   *
   * @param {!Object} uriObject
   * @return {String}
   * @private
   */
  _formatAddress(uriObject) {
    let address = '';
    uriObject.hosts.forEach(function (h, i) {
      if (i > 0) {
        address += ',';
      }
      address += encodeURIComponent(h.host);
      if (h.port) {
        address += `:${encodeURIComponent(h.port)}`;
      }
    });
    return address;
  }
}

module.exports = new MognoURI();

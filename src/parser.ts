import {isArray, isDefined, isFalsy, isObject, isString, isUndefined} from "@typeix/utils";
import {IParserConfig} from "./interfaces/iparser";
import {RouterError} from "./router-error";

const PATTERN_MATCH = /<((\w+):)?([^>]+)>/g;
const HAS_GROUP_START = /^\(/;
const HAS_GROUP_END = /\)$/;

/**
 * Route parser
 */
export class RouteParser {

  private reverseUrlPattern: string;
  private variableSize = 0;
  private urlMatchPattern: RegExp;
  private variables: Map<string, { pattern: RegExp, index: number }> = new Map();

  /**
   * I parser config
   * @param {string} path
   * @param {IParserConfig} config
   */
  constructor(path: string, config?: IParserConfig) {
    let pattern, anyPattern = "([\\s\\S]+)";
    if (isFalsy(path) || ["/", "*"].indexOf(path.charAt(0)) === -1) {
      throw new RouterError(
        500,
        "Url must start with \/ or it has to be * which match all patterns",
        {
          path,
          config
        }
      );
    } else if (PATTERN_MATCH.test(path)) {
      let vIndex = 0;
      pattern = path.replace(PATTERN_MATCH, (replace, key, source, index) => {
        let rPattern = index;
        if (isUndefined(key)) {
          rPattern = anyPattern;
        } else if (!HAS_GROUP_START.test(index) || !HAS_GROUP_END.test(index)) {
          rPattern = "(" + index + ")";
        }
        this.variables.set(
          isUndefined(key) ? index : key.slice(0, -1),
          {
            pattern: new RegExp((isUndefined(key) ? anyPattern : index)),
            index: vIndex
          }
        );
        vIndex++;
        return rPattern;
      });
      this.variableSize = vIndex + 1;
      this.reverseUrlPattern = path.replace(PATTERN_MATCH, (replace, key, source, index) => {
        return "<" + (isUndefined(source) ? index : source) + ">";
      });
    } else if (path === "*") {
      pattern = anyPattern;
    } else {
      pattern = path;
    }
    this.urlMatchPattern = new RegExp("^" + pattern + "$");
  }

  /**
   * Create url vars
   * @param {Object} vars
   * @returns {string}
   */
  public createUrl(vars: Object): string {
    if (this.verifyVariableKeys(vars) && isString(this.reverseUrlPattern)) {
      let keys = Object.keys(vars);
      let url = this.reverseUrlPattern;
      while (keys.length > 0) {
        let key = keys.pop();
        url = url.replace("<" + key + ">", vars[key]);
      }
      return url;
    }
    return null;
  }

  /**
   * Get parameters
   * @param {string} path
   * @returns {Object}
   */
  public getParams(path: string): Object {
    let data = {};
    let matches = this.urlMatchPattern.exec(path);
    if (isDefined(matches) && isArray(matches)) {
      let sMatches = matches.slice(1, this.variableSize + 1);
      this.variables.forEach((value, key) => {
        data[key] = sMatches[value.index];
      });
    }
    return data;
  }

  /**
   * Is valid path
   * @param {string} path
   * @returns {boolean}
   */
  public isValid(path: string): boolean {
    return this.urlMatchPattern.test(path);
  }


  /**
   * Verify variable keys
   * @param {Object} vars
   * @returns {boolean}
   */
  private verifyVariableKeys(vars: Object): boolean {
    let vKeys = Array.from(this.variables.keys());
    let oKeys = Object.keys(vars);
    return isObject(vars) && vKeys.every(key =>
      oKeys.indexOf(key) > -1 && this.variables.get(key).pattern.test(vars[key])
    );
  }

}

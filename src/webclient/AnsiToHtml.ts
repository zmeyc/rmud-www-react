// Following changes to ansi-to-html were made by RMUD team:
// - Treats bold text as highlighted.
// - Remove XML entities encoding.
// - TypeScript conversion.

/* const entities = require('entities'); */

export interface Options {
  fg: string
  bg: string
  newline: boolean
  stream: false
  colors: Record<number, string>
}

interface StickyStackElement {
  token: string
  data: string
  category: string | null
}

interface Handler {
  pattern: RegExp
  sub: (substring: string, ...args: any[]) => string
}

const defaults: Options = {
  fg: "#FFF",
  bg: "#000",
  newline: false,
  //escapeXML: false,
  stream: false,
  colors: getDefaultColors(),
}

function getDefaultColors() {
  const colors: Record<number, string> = {
    [0]: "#000",
    [1]: "#A00",
    [2]: "#0A0",
    [3]: "#A50",
    [4]: "#00A",
    [5]: "#A0A",
    [6]: "#0AA",
    [7]: "#AAA",
    [8]: "#555",
    [9]: "#F55",
    [10]: "#5F5",
    [11]: "#FF5",
    [12]: "#55F",
    [13]: "#F5F",
    [14]: "#5FF",
    [15]: "#FFF",
  }

  range(0, 5).forEach((red) => {
    range(0, 5).forEach((green) => {
      range(0, 5).forEach((blue) => setStyleColor(red, green, blue, colors))
    })
  })

  range(0, 23).forEach(function (gray) {
    const c = gray + 232
    const l = toHexString(gray * 10 + 8)

    colors[c] = "#" + l + l + l
  })

  return colors
}

/**
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {object} colors
 */
function setStyleColor(
  red: number,
  green: number,
  blue: number,
  colors: Record<number, string>,
) {
  const c = 16 + red * 36 + green * 6 + blue
  const r = red > 0 ? red * 40 + 55 : 0
  const g = green > 0 ? green * 40 + 55 : 0
  const b = blue > 0 ? blue * 40 + 55 : 0

  colors[c] = toColorHexString([r, g, b])
}

/**
 * Converts from a number like 15 to a hex string like 'F'
 * @param {number} num
 * @returns {string}
 */
function toHexString(num: number) {
  let str = num.toString(16)

  while (str.length < 2) {
    str = "0" + str
  }

  return str
}

/**
 * Converts from an array of numbers like [15, 15, 15] to a hex string like 'FFF'
 * @param {[red, green, blue]} ref
 * @returns {string}
 */
function toColorHexString(ref: [number, number, number]) {
  let results = []

  for (let j = 0, len = ref.length; j < len; j++) {
    results.push(toHexString(ref[j]))
  }

  return "#" + results.join("")
}

/**
 * @param {Array} stack
 * @param {string} token
 * @param {*} data
 * @param {object} options
 */
function generateOutput(
  stack: string[],
  token: string,
  data: string,
  options: Options,
) {
  let result

  if (token === "text") {
    result = pushText(data, options)
  } else if (token === "display") {
    result = handleDisplay(stack, data, options)
  } else if (token === "xterm256") {
    result = pushForegroundColor(stack, options.colors[Number(data)])
  }

  return result
}

/**
 * @param {Array} stack
 * @param {number} code
 * @param {object} options
 * @returns {*}
 */
function handleDisplay(stack: string[], codeString: string, options: Options) {
  const code = parseInt(codeString, 10)
  let result

  const codeMap: Record<number, () => string> = {
    [-1]: () => "<br/>",
    [0]: () => (stack.length ? resetStyles(stack) : ""),
    [1]: () => pushTag(stack, "b"),
    [3]: () => pushTag(stack, "i"),
    [4]: () => pushTag(stack, "u"),
    [8]: () => pushStyle(stack, "display:none"),
    [9]: () => pushTag(stack, "strike"),
    [22]: () => closeTag(stack, "b"),
    [23]: () => closeTag(stack, "i"),
    [24]: () => closeTag(stack, "u"),
    [39]: () => pushForegroundColor(stack, options.fg),
    [49]: () => pushBackgroundColor(stack, options.bg),
  }

  if (codeMap[code]) {
    result = codeMap[code]()
  } else if (4 < code && code < 7) {
    result = pushTag(stack, "blink")
  } else if (29 < code && code < 38) {
    //result = pushForegroundColor(stack, options.colors[code - 30])
    if (stack.slice(-1)[0] !== "b") {
      result = pushForegroundColor(stack, options.colors[code - 30])
    } else {
      result = pushForegroundColor(stack, options.colors[8 + code - 30])
    }
  } else if (39 < code && code < 48) {
    result = pushBackgroundColor(stack, options.colors[code - 40])
  } else if (89 < code && code < 98) {
    result = pushForegroundColor(stack, options.colors[8 + (code - 90)])
  } else if (99 < code && code < 108) {
    result = pushBackgroundColor(stack, options.colors[8 + (code - 100)])
  }

  return result
}

/**
 * Clear all the styles
 * @returns {string}
 */
function resetStyles(stack: string[]) {
  let stackClone = stack.slice(0)

  stack.length = 0

  return stackClone
    .reverse()
    .map(function (tag) {
      if (tag == "b") {
        return ""
      }
      return "</" + tag + ">"
    })
    .join("")
}

/**
 * Creates an array of numbers ranging from low to high
 * @param {number} low
 * @param {number} high
 * @returns {Array}
 * @example range(3, 7); // creates [3, 4, 5, 6, 7]
 */
function range(low: number, high: number): number[] {
  const results = []

  for (let j = low; j <= high; j++) {
    results.push(j)
  }

  return results
}

/**
 * Returns a new function that is true if value is NOT the same category
 * @param {string} category
 * @returns {function}
 */
function notCategory(category: string | null) {
  return function (e: StickyStackElement) {
    return (category === null || e.category !== category) && category !== "all"
  }
}

/**
 * Converts a code into an ansi token type
 * @param {number} code
 * @returns {string}
 */
function categoryForCode(codeString: string) {
  const code = parseInt(codeString, 10)
  let result = null

  if (code === 0) {
    result = "all"
  } else if (code === 1) {
    result = "bold"
  } else if (2 < code && code < 5) {
    result = "underline"
  } else if (4 < code && code < 7) {
    result = "blink"
  } else if (code === 8) {
    result = "hide"
  } else if (code === 9) {
    result = "strike"
  } else if (
    (29 < code && code < 38) ||
    code === 39 ||
    (89 < code && code < 98)
  ) {
    result = "foreground-color"
  } else if (
    (39 < code && code < 48) ||
    code === 49 ||
    (99 < code && code < 108)
  ) {
    result = "background-color"
  }

  return result
}

/**
 * @param {string} text
 * @param {object} options
 * @returns {string}
 */
function pushText(text: string, _options: Options) {
  //if (options.escapeXML) {
  //  return entities.encodeXML(text)
  //}

  return text
}

/**
 * @param {Array} stack
 * @param {string} tag
 * @param {string} [style='']
 * @returns {string}
 */
function pushTag(stack: string[], tag: string, style?: string) {
  stack.push(tag)

  if (tag == "b") {
    return ""
  }

  return ["<" + tag, style ? ' style="' + style + '"' : void 0, ">"].join("")
}

/**
 * @param {Array} stack
 * @param {string} style
 * @returns {string}
 */
function pushStyle(stack: string[], style: string) {
  return pushTag(stack, "span", style)
}

function pushForegroundColor(stack: string[], color: string) {
  return pushTag(stack, "span", "color:" + color)
}

function pushBackgroundColor(stack: string[], color: string) {
  return pushTag(stack, "span", "background-color:" + color)
}

/**
 * @param {Array} stack
 * @param {string} style
 * @returns {string}
 */
function closeTag(stack: string[], tag: string) {
  let last

  if (stack.slice(-1)[0] === tag) {
    last = stack.pop()
  }

  if (last) {
    if (last === "b") {
      return ""
    }
    return "</" + tag + ">"
  } else {
    return ""
  }
}

/**
 * @param {string} text
 * @param {object} options
 * @param {function} callback
 * @returns {Array}
 */
function tokenize(
  text: string,
  options: Options,
  callback: (token: string, data: string) => void,
) {
  let ansiMatch = false
  const ansiHandler = 3

  function remove() {
    return ""
  }

  function removeXterm256(_m: string, g1: string) {
    callback("xterm256", g1)
    return ""
  }

  function newline(m: string) {
    if (options.newline) {
      callback("display", "-1")
    } else {
      callback("text", m)
    }

    return ""
  }

  function ansiMess(_m: string, g1: string) {
    ansiMatch = true
    if (g1.trim().length === 0) {
      g1 = "0"
    }

    const g1elements = g1.trimEnd().split(";")

    for (let o = 0, len = g1elements.length; o < len; o++) {
      callback("display", g1elements[o])
    }

    return ""
  }

  function realText(m: string) {
    callback("text", m)

    return ""
  }

  /* eslint no-control-regex:0 */
  const tokens: Handler[] = [
    {
      pattern: /^\x08+/,
      sub: remove,
    },
    {
      pattern: /^\x1b\[[012]?K/,
      sub: remove,
    },
    {
      pattern: /^\x1b\[\(B/,
      sub: remove,
    },
    {
      pattern: /^\x1b\[38;5;(\d+)m/,
      sub: removeXterm256,
    },
    {
      pattern: /^\n/,
      sub: newline,
    },
    {
      pattern: /^\x1b\[((?:\d{1,3};?)+|)m/,
      sub: ansiMess,
    },
    {
      pattern: /^\x1b\[?[\d;]{0,3}/,
      sub: remove,
    },
    {
      pattern: /^([^\x1b\x08\n]+)/,
      sub: realText,
    },
  ]

  function process(handler: Handler, i: number) {
    if (i > ansiHandler && ansiMatch) {
      return
    }

    ansiMatch = false

    text = text.replace(handler.pattern, handler.sub)
  }

  let handler
  let results1 = []
  let length = text.length

  outer: while (length > 0) {
    for (let i = 0, o = 0, len = tokens.length; o < len; i = ++o) {
      handler = tokens[i]
      process(handler, i)

      if (text.length !== length) {
        // We matched a token and removed it from the text. We need to
        // start matching *all* tokens against the new text.
        length = text.length
        continue outer
      }
    }

    if (text.length === length) {
      break
    } else {
      results1.push(0)
    }

    length = text.length
  }

  return results1
}

/**
 * If streaming, then the stack is "sticky"
 *
 * @param {Array} stickyStack
 * @param {string} token
 * @param {*} data
 * @returns {Array}
 */
function updateStickyStack(
  stickyStack: StickyStackElement[],
  token: string,
  data: string,
) {
  if (token !== "text") {
    const notTheSameCategoryChecker = notCategory(categoryForCode(data))
    stickyStack = stickyStack.filter(notTheSameCategoryChecker)
    stickyStack.push({
      token: token,
      data: data,
      category: categoryForCode(data),
    })
  }

  return stickyStack
}

export class AnsiFilter {
  opts: Options
  stack: string[] = []
  stickyStack: StickyStackElement[] = []

  constructor(options?: Partial<Options>) {
    this.opts = {
      ...defaults,
      ...options,
      colors: options?.colors
        ? { ...defaults.colors, ...options.colors }
        : defaults.colors,
    }
    this.stack = []
    this.stickyStack = []
  }

  toHtml = (input: string | string[]) => {
    input = typeof input === "string" ? [input] : input
    const stack = this.stack
    const options = this.opts
    const buf = []

    this.stickyStack.forEach((element) => {
      let output = generateOutput(stack, element.token, element.data, options)

      if (output) {
        buf.push(output)
      }
    })

    tokenize(input.join(""), options, (token, data) => {
      let output = generateOutput(stack, token, data, options)

      if (output) {
        buf.push(output)
      }

      if (options.stream) {
        this.stickyStack = updateStickyStack(this.stickyStack, token, data)
      }
    })

    if (stack.length) {
      buf.push(resetStyles(stack))
    }

    return buf.join("")
  }
}

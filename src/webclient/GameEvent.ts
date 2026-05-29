export interface AnsiText {
  type: "ansiText"
  text: string
}

export interface StreamCommand {
  type: "streamCommand"
  command: string
}

export interface Link {
  type: "link"
  text: string
  href: string
}

export type GameEvent = AnsiText | StreamCommand | Link

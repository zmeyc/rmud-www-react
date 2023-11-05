export interface AnsiText {
  type: "ansiText"
  text: string
}

export interface StreamCommand {
  type: "streamCommand"
  command: string
}

export type GameEvent = AnsiText | StreamCommand

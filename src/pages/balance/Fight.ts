// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AttackModifiers {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DefenseModifiers {}

type WearPosition = "wield" | "twoHand" | "hold"

interface Weapon {
  weight: number
  position: WearPosition
}

export function calculateAttack(_modifiers: AttackModifiers) {
  const attack = 0
  return attack
}

export function calculateDefense(_modifiers: DefenseModifiers) {
  const defense = 0
  return defense
}

export function weaponEfficiency(strength: number, weapon: Weapon) {
  const realStrength = (() => {
    switch (weapon.position) {
      case "wield":
        return strength
      case "twoHand":
        return strength * 2
      case "hold":
        return Math.floor(strength / 2) + 2
    }
  })()
  return Math.max(0, 100 - Math.max(0, weapon.weight - realStrength) * 10)
}

export function didHitTarget(strength: number, weapon?: Weapon) {
  const attack = calculateAttack({})
  const defense = calculateDefense({})

  const isAttackThrowSuccesful =
    attack + randomIntInclusive(1, 100) > defense + 50

  const isWeaponThrowSuccesfull = weapon
    ? weaponEfficiency(strength, weapon) >= randomIntInclusive(1, 100)
    : true

  return isAttackThrowSuccesful && isWeaponThrowSuccesfull
}

export function probability(
  experiment: () => boolean,
  numberOfTrials = 10000000,
) {
  let successfulAttempts = 0

  for (let i = 0; i < numberOfTrials; ++i) {
    if (experiment()) {
      ++successfulAttempts
    }
  }

  const probability = successfulAttempts / numberOfTrials
  return probability
}

function randomIntInclusive(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

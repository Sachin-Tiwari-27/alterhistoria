export function buildNationIdentity(player: PlayerNation): string {
  const name = player.customName ?? player.name;
  const polity = player.customPolity ?? player.polity;
  const capital = player.customCapital ?? player.capital;
  const flag = player.customFlag ?? player.flag;
  const desc = player.customDescription ?? player.context;

  return `NATION: ${flag} ${name} | POLITY: ${polity} | CAPITAL: ${capital}
IDENTITY: ${desc}
LORE: ${player.lore.slice(-3).join(" → ")}`;
}

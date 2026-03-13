export interface HistoricalMilestone {
  from: number;
  to: number;
  text: string;
}

export const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    from: 1921,
    to: 1921,
    text: "1921: Irish Free State established; Lenin's New Economic Policy; Washington Naval Conference; Chinese Communist Party founded",
  },
  {
    from: 1922,
    to: 1922,
    text: "1922: USSR formally established; Mussolini marches on Rome; Turkish victory in Greco-Turkish War; Egypt gains nominal independence",
  },
  {
    from: 1923,
    to: 1923,
    text: "1923: German hyperinflation crisis peaks; Hitler's Beer Hall Putsch fails; French occupation of the Ruhr; Turkish Republic proclaimed",
  },
  {
    from: 1924,
    to: 1924,
    text: "1924: Lenin dies; Stalin begins consolidating power; Dawes Plan stabilises German economy; Labour Party governs Britain briefly",
  },
  {
    from: 1925,
    to: 1926,
    text: "1925-26: Locarno Treaties signed; Reza Khan becomes Shah of Iran; General Strike in UK; Syrian revolt against France",
  },
  {
    from: 1927,
    to: 1927,
    text: "1927: Chiang Kai-shek purges Communists; Stalin expels Trotsky; Lindbergh crosses Atlantic; Chinese Civil War intensifies",
  },
  {
    from: 1928,
    to: 1929,
    text: "1928-29: Stalin's First Five-Year Plan; Kellogg-Briand Pact; Wall Street Crash triggers Great Depression; Young Plan on German reparations",
  },
  {
    from: 1930,
    to: 1931,
    text: "1930-31: Great Depression spreads globally; Gandhi's Salt March; Japan invades Manchuria; Spanish Republic proclaimed",
  },
  {
    from: 1932,
    to: 1932,
    text: "1932: Nazis become largest party in German parliament; Bonus Army dispersed in Washington; FDR elected; Holodomor begins in Ukraine",
  },
  {
    from: 1933,
    to: 1933,
    text: "1933: Hitler becomes Chancellor; Germany leaves League of Nations; FDR's New Deal begins; Prohibition ends in USA",
  },
  {
    from: 1934,
    to: 1934,
    text: "1934: Hitler becomes Führer after Hindenburg dies; Stalin's purges begin; Long March starts in China; Kirov assassination",
  },
  {
    from: 1935,
    to: 1935,
    text: "1935: Italy invades Ethiopia; Nuremberg Laws enacted against Jews; Social Security Act in USA; Persia renamed Iran",
  },
  {
    from: 1936,
    to: 1936,
    text: "1936: Spanish Civil War begins; Remilitarisation of Rhineland; Rome-Berlin Axis; Popular Front governments in France and Spain",
  },
  {
    from: 1937,
    to: 1937,
    text: "1937: Japan invades China (Marco Polo Bridge Incident); Nanjing Massacre; Stalin's Great Terror peaks; Guernica bombed",
  },
  {
    from: 1938,
    to: 1938,
    text: "1938: Germany annexes Austria (Anschluss); Munich Agreement; Crystal Night pogrom; Japan captures much of coastal China",
  },
  {
    from: 1939,
    to: 1939,
    text: "1939: Germany invades Poland; WWII begins; Molotov-Ribbentrop Pact; Soviet invasion of Finland (Winter War)",
  },
  {
    from: 1940,
    to: 1940,
    text: "1940: Fall of France; Battle of Britain; Japan joins Axis; Blitzkrieg sweeps Western Europe; Churchill becomes PM",
  },
  {
    from: 1941,
    to: 1941,
    text: "1941: Germany invades Soviet Union (Operation Barbarossa); Japan attacks Pearl Harbor; USA enters WWII; Holocaust begins systematically",
  },
  {
    from: 1942,
    to: 1942,
    text: "1942: Battle of Stalingrad begins; El Alamein; Midway turns Pacific war; Wannsee Conference; Manhattan Project accelerates",
  },
  {
    from: 1943,
    to: 1943,
    text: "1943: Stalingrad - Germany's first major defeat; Allied landings in Italy; Italian armistice; Kursk - largest tank battle",
  },
  {
    from: 1944,
    to: 1944,
    text: "1944: D-Day Normandy landings; Liberation of Paris; Warsaw Uprising crushed; Battle of the Bulge",
  },
  {
    from: 1945,
    to: 1945,
    text: "1945: Germany surrenders May 8; Atomic bombs on Hiroshima and Nagasaki; Japan surrenders; UN founded; Holocaust revealed in full",
  },
  {
    from: 1946,
    to: 1946,
    text: "1946: Cold War begins; Churchill's Iron Curtain speech; Philippines independence; Nuremberg verdicts",
  },
  {
    from: 1947,
    to: 1947,
    text: "1947: India and Pakistan independence; Partition violence kills millions; Marshall Plan; Truman Doctrine; CIA established; Dead Sea Scrolls found",
  },
  {
    from: 1948,
    to: 1948,
    text: "1948: Israel founded; Arab-Israeli War; Berlin Blockade; NATO negotiations; Gandhi assassinated; Universal Declaration of Human Rights",
  },
  {
    from: 1949,
    to: 1949,
    text: "1949: NATO formed; China becomes Communist under Mao; Soviet atomic bomb tested; Germany divided into East and West",
  },
  {
    from: 1950,
    to: 1953,
    text: "1950-53: Korean War; McCarthyism peaks in USA; European Coal and Steel Community founded",
  },
  {
    from: 1954,
    to: 1956,
    text: "1954-56: French defeat at Dien Bien Phu ends Indochina; Bandung Non-Aligned Conference; Suez Crisis; Hungarian Revolution crushed by Soviets",
  },
  {
    from: 1957,
    to: 1959,
    text: "1957-59: Sputnik launched; European Common Market formed; Castro takes Cuba; Dalai Lama flees Tibet",
  },
  {
    from: 1960,
    to: 1963,
    text: "1960-63: African decolonisation wave; Berlin Wall built; Cuban Missile Crisis; JFK assassinated; Vietnam War escalates",
  },
  {
    from: 1964,
    to: 1968,
    text: "1964-68: Civil Rights Act; Cultural Revolution in China; Prague Spring crushed; Martin Luther King assassinated; Tet Offensive",
  },
  {
    from: 1969,
    to: 1972,
    text: "1969-72: Moon landing; Nixon opens China; Détente; Bangladesh independence war; Munich Olympics massacre",
  },
  {
    from: 1973,
    to: 1976,
    text: "1973-76: Yom Kippur War; Oil crisis; Watergate; Vietnam War ends; Cambodian genocide; Mao dies",
  },
  {
    from: 1977,
    to: 1980,
    text: "1977-80: Carter era; Iranian Revolution; Soviet invasion of Afghanistan; Solidarity movement in Poland; Thatcher elected",
  },
];

export function getMilestonesForRange(from: number, to: number): string {
  return (
    HISTORICAL_MILESTONES.filter((m) => m.from <= to && m.to >= from)
      .map((m) => m.text)
      .join("; ") || "Minor geopolitical shifts"
  );
}

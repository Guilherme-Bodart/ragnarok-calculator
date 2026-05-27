export type MvpCatalogEntry = {
  id: string;
  monsterId: string;
  name: string;
  mapId: string;
  mapName: string;
  respawnMinutes: number;
  respawnLabel: string;
};

export const MVP_RESPAWN_RANDOM_DELAY_MINUTES = 10;

// Source: bROWiki Arquivo, MVP table, fetched from https://arquivo.browiki.org/api.php?action=parse&page=MVP&prop=wikitext&format=json&formatversion=2
// The source notes that MVP respawns may have an official 0-10 minute delay.
export const mvpCatalog = [
  {
    "id": "1059-gld_dun02",
    "monsterId": "1059",
    "name": "Abelha-Rainha",
    "mapId": "gld_dun02",
    "mapName": "gld_dun02",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1059-mjolnir_04",
    "monsterId": "1059",
    "name": "Abelha-Rainha",
    "mapId": "mjolnir_04",
    "mapName": "mjolnir_04",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1511-moc_pryd06",
    "monsterId": "1511",
    "name": "Amon Ra",
    "mapId": "moc_pryd06",
    "mapName": "moc_pryd06",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "2362-moc_prydn2",
    "monsterId": "2362",
    "name": "Amon Ra do Pesadelo",
    "mapId": "moc_prydn2",
    "mapName": "moc_prydn2",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "2441-teg_dun01",
    "monsterId": "2441",
    "name": "Aprendiz",
    "mapId": "teg_dun01",
    "mapName": "teg_dun01",
    "respawnMinutes": 180,
    "respawnLabel": "3 horas"
  },
  {
    "id": "20421-gl_cas01_",
    "monsterId": "20421",
    "name": "Aranha Rainha",
    "mapId": "gl_cas01_",
    "mapName": "gl_cas01_",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1785-gld_dun03_2",
    "monsterId": "1785",
    "name": "Atroce",
    "mapId": "gld_dun03_2",
    "mapName": "gld_dun03_2",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1785-ra_fild03",
    "monsterId": "1785",
    "name": "Atroce",
    "mapId": "ra_fild03",
    "mapName": "ra_fild03",
    "respawnMinutes": 180,
    "respawnLabel": "3 horas"
  },
  {
    "id": "1785-ra_fild04",
    "monsterId": "1785",
    "name": "Atroce",
    "mapId": "ra_fild04",
    "mapName": "ra_fild04",
    "respawnMinutes": 300,
    "respawnLabel": "5 horas"
  },
  {
    "id": "1785-ve_fild01",
    "monsterId": "1785",
    "name": "Atroce",
    "mapId": "ve_fild01",
    "mapName": "ve_fild01",
    "respawnMinutes": 180,
    "respawnLabel": "3 horas"
  },
  {
    "id": "1785-ve_fild02",
    "monsterId": "1785",
    "name": "Atroce",
    "mapId": "ve_fild02",
    "mapName": "ve_fild02",
    "respawnMinutes": 360,
    "respawnLabel": "6 horas"
  },
  {
    "id": "2483-gl_cas02_",
    "monsterId": "2483",
    "name": "Bafomé Amaldiçoado",
    "mapId": "gl_cas02_",
    "mapName": "gl_cas02_",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1874-abbey03",
    "monsterId": "1874",
    "name": "Belzebu",
    "mapId": "abbey03",
    "mapName": "abbey03",
    "respawnMinutes": 720,
    "respawnLabel": "12 horas"
  },
  {
    "id": "1086-prt_sewb4",
    "monsterId": "1086",
    "name": "Besouro-Ladrão Dourado",
    "mapId": "prt_sewb4",
    "mapName": "prt_sewb4",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1871-abbey02",
    "monsterId": "1871",
    "name": "Bispo Decadente",
    "mapId": "abbey02",
    "mapName": "abbey02",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "2068-bra_dun02",
    "monsterId": "2068",
    "name": "Boitatá",
    "mapId": "bra_dun02",
    "mapName": "bra_dun02",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1251-xmas_dun02",
    "monsterId": "1251",
    "name": "Cavaleiro da Tempestade",
    "mapId": "xmas_dun02",
    "mapName": "xmas_dun02",
    "respawnMinutes": 67,
    "respawnLabel": "1 hora e 7 minutos"
  },
  {
    "id": "20618-abyss_04",
    "monsterId": "20618",
    "name": "Detale Esqueleto",
    "mapId": "abyss_04",
    "mapName": "abyss_04",
    "respawnMinutes": 180,
    "respawnLabel": "3 horas"
  },
  {
    "id": "1719-abyss_03",
    "monsterId": "1719",
    "name": "Detardeurus",
    "mapId": "abyss_03",
    "mapName": "abyss_03",
    "respawnMinutes": 180,
    "respawnLabel": "3 horas"
  },
  {
    "id": "1046-gef_dun02",
    "monsterId": "1046",
    "name": "Doppelganger",
    "mapId": "gef_dun02",
    "mapName": "gef_dun02",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1046-gld_dun02",
    "monsterId": "1046",
    "name": "Doppelganger",
    "mapId": "gld_dun02",
    "mapName": "gld_dun02",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1046-gld_dun04",
    "monsterId": "1046",
    "name": "Doppelganger",
    "mapId": "gld_dun04",
    "mapName": "gld_dun04",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1389-gef_dun01",
    "monsterId": "1389",
    "name": "Drácula",
    "mapId": "gef_dun01",
    "mapName": "gef_dun01",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1112-treasure02",
    "monsterId": "1112",
    "name": "Drake",
    "mapId": "treasure02",
    "mapName": "treasure02",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1115-gld_dun01",
    "monsterId": "1115",
    "name": "Eddga",
    "mapId": "gld_dun01",
    "mapName": "gld_dun01",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1115-gld_dun01_2",
    "monsterId": "1115",
    "name": "Eddga",
    "mapId": "gld_dun01_2",
    "mapName": "gld_dun01_2",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1115-pay_fild10",
    "monsterId": "1115",
    "name": "Eddga",
    "mapId": "pay_fild10",
    "mapName": "pay_fild10",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1658-lhz_dun02",
    "monsterId": "1658",
    "name": "Espadachim Egnigem",
    "mapId": "lhz_dun02",
    "mapName": "lhz_dun02",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1157-in_sphinx5",
    "monsterId": "1157",
    "name": "Faraó",
    "mapId": "in_sphinx5",
    "mapName": "in_sphinx5",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1150-gld_dun01",
    "monsterId": "1150",
    "name": "Flor do Luar",
    "mapId": "gld_dun01",
    "mapName": "gld_dun01",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1150-pay_dun04",
    "monsterId": "1150",
    "name": "Flor do Luar",
    "mapId": "pay_dun04",
    "mapName": "pay_dun04",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1159-moc_fild17",
    "monsterId": "1159",
    "name": "Freeoni",
    "mapId": "moc_fild17",
    "mapName": "moc_fild17",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "3505-lasa_dun01",
    "monsterId": "3505",
    "name": "Gemaring",
    "mapId": "lasa_dun01",
    "mapName": "lasa_dun01",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "2253-gld2_pay",
    "monsterId": "2253",
    "name": "General Daehyun",
    "mapId": "gld2_pay",
    "mapName": "gld2_pay",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1312-tur_dun04",
    "monsterId": "1312",
    "name": "General Tartaruga",
    "mapId": "tur_dun04",
    "mapName": "tur_dun04",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "2251-gld2_ald",
    "monsterId": "2251",
    "name": "Gioia",
    "mapId": "gld2_ald",
    "mapName": "gld2_ald",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1885-mosk_dun03",
    "monsterId": "1885",
    "name": "Gorynych",
    "mapId": "mosk_dun03",
    "mapName": "mosk_dun03",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "2255-gld2_gef",
    "monsterId": "2255",
    "name": "Guardião Morto Kades",
    "mapId": "gld2_gef",
    "mapName": "gld2_gef",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1252-xmas_fild01",
    "monsterId": "1252",
    "name": "Hatii",
    "mapId": "xmas_fild01",
    "mapName": "xmas_fild01",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1832-thor_v03",
    "monsterId": "1832",
    "name": "Ifrit",
    "mapId": "thor_v03",
    "mapName": "thor_v03",
    "respawnMinutes": 660,
    "respawnLabel": "11 horas"
  },
  {
    "id": "20601-ein_dun03",
    "monsterId": "20601",
    "name": "Joialiant",
    "mapId": "ein_dun03",
    "mapName": "ein_dun03",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1734-kh_dun02",
    "monsterId": "1734",
    "name": "Kiel-D-01",
    "mapId": "kh_dun02",
    "mapName": "kh_dun02",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "2202-iz_dun05",
    "monsterId": "2202",
    "name": "Kraken",
    "mapId": "iz_dun05",
    "mapName": "iz_dun05",
    "respawnMinutes": 140,
    "respawnLabel": "2 horas e 20 min."
  },
  {
    "id": "1779-ice_dun03",
    "monsterId": "1779",
    "name": "Ktullanux",
    "mapId": "ice_dun03",
    "mapName": "ice_dun03",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1630-lou_dun03",
    "monsterId": "1630",
    "name": "Lady Branca",
    "mapId": "lou_dun03",
    "mapName": "lou_dun03",
    "respawnMinutes": 116,
    "respawnLabel": "1 hora e 56 min."
  },
  {
    "id": "1688-ayo_dun02",
    "monsterId": "1688",
    "name": "Lady Tanee",
    "mapId": "ayo_dun02",
    "mapName": "ayo_dun02",
    "respawnMinutes": 420,
    "respawnLabel": "7 horas"
  },
  {
    "id": "1688-gld_dun03",
    "monsterId": "1688",
    "name": "Lady Tanee",
    "mapId": "gld_dun03",
    "mapName": "gld_dun03",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1688-prt_maze03",
    "monsterId": "1688",
    "name": "Lady Tanee",
    "mapId": "prt_maze03",
    "mapName": "prt_maze03",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "2156-dew_dun01",
    "monsterId": "2156",
    "name": "Leak",
    "mapId": "dew_dun01",
    "mapName": "dew_dun01",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "20422-gl_cas01_",
    "monsterId": "20422",
    "name": "Lorde das Trevas",
    "mapId": "gl_cas01_",
    "mapName": "gl_cas01_",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1147-anthell02",
    "monsterId": "1147",
    "name": "Maya",
    "mapId": "anthell02",
    "mapName": "anthell02",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1147-gld_dun02_2",
    "monsterId": "1147",
    "name": "Maya",
    "mapId": "gld_dun02_2",
    "mapName": "gld_dun02_2",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1147-gld_dun03",
    "monsterId": "1147",
    "name": "Maya",
    "mapId": "gld_dun03",
    "mapName": "gld_dun03",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1917-moc_fild22",
    "monsterId": "1917",
    "name": "Morroc Ferido",
    "mapId": "moc_fild22",
    "mapName": "moc_fild22",
    "respawnMinutes": 720,
    "respawnLabel": "12 horas"
  },
  {
    "id": "20419-mag_dun03",
    "monsterId": "20419",
    "name": "Muspellskoll",
    "mapId": "mag_dun03",
    "mapName": "mag_dun03",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1087-gef_fild03",
    "monsterId": "1087",
    "name": "Orc Herói",
    "mapId": "gef_fild03",
    "mapName": "gef_fild03",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1038-moc_pryd04",
    "monsterId": "1038",
    "name": "Osíris",
    "mapId": "moc_pryd04",
    "mapName": "moc_pryd04",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1768-ra_san05",
    "monsterId": "1768",
    "name": "Pesar Noturno",
    "mapId": "ra_san05",
    "mapName": "ra_san05",
    "respawnMinutes": 300,
    "respawnLabel": "5 horas"
  },
  {
    "id": "2249-gld2_prt",
    "monsterId": "2249",
    "name": "Pyuriel Furiosa",
    "mapId": "gld2_prt",
    "mapName": "gld2_prt",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "3633-slabw01",
    "monsterId": "3633",
    "name": "Quimera Venenosa",
    "mapId": "slabw01",
    "mapName": "slabw01",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "20381-sp_rudus2",
    "monsterId": "20381",
    "name": "R48-85-Bestia",
    "mapId": "sp_rudus2",
    "mapName": "sp_rudus2",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "2087-dic_dun02",
    "monsterId": "2087",
    "name": "Rainha Scaraba",
    "mapId": "dic_dun02",
    "mapName": "dic_dun02",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "2165-dic_dun03",
    "monsterId": "2165",
    "name": "Rainha Scaraba Dourada",
    "mapId": "dic_dun03",
    "mapName": "dic_dun03",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1623-ein_dun02",
    "monsterId": "1623",
    "name": "RSX-0806",
    "mapId": "ein_dun02",
    "mapName": "ein_dun02",
    "respawnMinutes": 125,
    "respawnLabel": "2 horas e 5 min."
  },
  {
    "id": "1492-ama_dun03",
    "monsterId": "1492",
    "name": "Samurai Encarnado",
    "mapId": "ama_dun03",
    "mapName": "ama_dun03",
    "respawnMinutes": 91,
    "respawnLabel": "1 hora e 31 min."
  },
  {
    "id": "1272-gl_chyard",
    "monsterId": "1272",
    "name": "Senhor das Trevas",
    "mapId": "gl_chyard",
    "mapName": "gl_chyard",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1272-gl_chyard_",
    "monsterId": "1272",
    "name": "Senhor das Trevas",
    "mapId": "gl_chyard_",
    "mapName": "gl_chyard_",
    "respawnMinutes": 60,
    "respawnLabel": "1 hora"
  },
  {
    "id": "1272-gld_dun04",
    "monsterId": "1272",
    "name": "Senhor das Trevas",
    "mapId": "gld_dun04",
    "mapName": "gld_dun04",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1272-gld_dun04_2",
    "monsterId": "1272",
    "name": "Senhor das Trevas",
    "mapId": "gld_dun04_2",
    "mapName": "gld_dun04_2",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1190-gef_fild10",
    "monsterId": "1190",
    "name": "Senhor dos Orcs",
    "mapId": "gef_fild10",
    "mapName": "gef_fild10",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "1418-gon_dun03",
    "monsterId": "1418",
    "name": "Serpente Suprema",
    "mapId": "gon_dun03",
    "mapName": "gon_dun03",
    "respawnMinutes": 94,
    "respawnLabel": "1 hora e 34 min."
  },
  {
    "id": "2442-teg_dun02",
    "monsterId": "2442",
    "name": "Superaprendiz",
    "mapId": "teg_dun02",
    "mapName": "teg_dun02",
    "respawnMinutes": 180,
    "respawnLabel": "3 horas"
  },
  {
    "id": "1583-beach_dun",
    "monsterId": "1583",
    "name": "Tao Gunka",
    "mapId": "beach_dun",
    "mapName": "beach_dun",
    "respawnMinutes": 300,
    "respawnLabel": "5 horas"
  },
  {
    "id": "1751-odin_tem03",
    "monsterId": "1751",
    "name": "Valquíria Randgris",
    "mapId": "odin_tem03",
    "mapName": "odin_tem03",
    "respawnMinutes": 480,
    "respawnLabel": "8 horas"
  },
  {
    "id": "1685-jupe_core",
    "monsterId": "1685",
    "name": "Vesper",
    "mapId": "jupe_core",
    "mapName": "jupe_core",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  },
  {
    "id": "3074-c_tower3_",
    "monsterId": "3074",
    "name": "Vigia do Tempo",
    "mapId": "c_tower3_",
    "mapName": "c_tower3_",
    "respawnMinutes": 120,
    "respawnLabel": "2 horas"
  }
] as const satisfies readonly MvpCatalogEntry[];

export function getMvpCatalogEntry(entryId: string) {
  return mvpCatalog.find((entry) => entry.id === entryId) ?? null;
}

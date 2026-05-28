# Costume Walker Guide

Guia rapido para o proximo chat atualizar o boneco andando da landing.

## Onde fica

- Config do personagem: `scripts/costume-character.json`
- Gerador do GIF: `scripts/generate-costume-walker.mjs`
- GIF final usado na landing: `public/sprites/nightmare-walker.gif`
- Comando para gerar: `npm run sprite:costume`
- Componente que usa o GIF: `components/site/sprite-stage.tsx`

## O que pedir ao usuario

Peca ou aceite este formato:

```txt
classe/job: 4061
genero: male
jRO costume: sim
hair style: 25
hair color: branco
body clothes color: 7
upper item id: 20018
middle item id: 20430
lower item id: 20407
garment item id: 31737
```

## Campos do JSON

```json
{
  "gender": 1,
  "job": ["4061"],
  "head": 25,
  "headPalette": 6,
  "headdir": 0,
  "headgear": [1208, 1440, 1418],
  "garment": 55,
  "bodyPalette": 7,
  "madogearType": 0,
  "action": 8,
  "canvas": "200x200+100+150",
  "outfit": 1
}
```

Notas:

- `gender`: `1` masculino, `0` feminino.
- `job`: usar o id da classe como string. Warlock e `4061`.
- `head`: hair style.
- `headPalette`: cor do cabelo. No visual atual, branco e `6`.
- `bodyPalette`: cor da roupa. No visual atual, roupa `7`.
- `outfit`: `1` liga roupa jRO. `0` volta para a roupa antiga.
- `action`: deixar `8`. Isso e a acao de walk.
- O GIF anda porque o script usa `frame: 0..7` com `action: 8` fixa.

## Atencao aos IDs

O site mostra item ids, mas a API de render nao usa item ids diretamente para `headgear` e `garment`.

Ela usa:

- `headgear`: accessory ids internos.
- `garment`: garment id interno.

Exemplo atual:

| Slot | Item id pedido | Nome | ID interno usado |
| --- | ---: | --- | ---: |
| upper | 20018 | Costume Long Wolf Ears | 1208 |
| middle | 20430 | Costume Loyal Servant of Morroc | 1440 |
| lower | 20407 | Costume Test Subject Aura (Red) | 1418 |
| garment | 31737 | Costume Lucifer's Wings | 55 |

## Como converter item id para ID interno

Headgear:

```powershell
$raw = (Invoke-WebRequest "https://db.irowiki.org/metadata/headgear_costumes.json" -TimeoutSec 30).Content
$id = 20018
$m = [regex]::Match($raw, '(?s)\{\s*"accessory_id"\s*:\s*(\d+),\s*"location"\s*:\s*(\d+),\s*"items"\s*:\s*\[(?:(?!\}\s*,\s*\{\s*"accessory_id").)*?"item_id"\s*:\s*' + $id + '\b(?:(?!\}\s*,\s*\{\s*"accessory_id").)*?\]\s*\}')
"accessory_id=$($m.Groups[1].Value) location=$($m.Groups[2].Value)"
```

Garment:

```powershell
$raw = (Invoke-WebRequest "https://db.irowiki.org/metadata/garment_costumes.json" -TimeoutSec 30).Content
$id = 31737
$m = [regex]::Match($raw, '(?s)\{\s*"garment_id"\s*:\s*(\d+),\s*"items"\s*:\s*\[(?:(?!\}\s*,\s*\{\s*"garment_id").)*?"item_id"\s*:\s*' + $id + '\b(?:(?!\}\s*,\s*\{\s*"garment_id").)*?\]\s*\}')
"garment_id=$($m.Groups[1].Value)"
```

Tambem da para abrir os metadata manualmente:

- `https://db.irowiki.org/metadata/headgear_costumes.json`
- `https://db.irowiki.org/metadata/garment_costumes.json`

## Fluxo para atualizar

1. Converter os item ids do usuario para IDs internos.
2. Editar `scripts/costume-character.json`.
3. Rodar:

```powershell
npm run sprite:costume
```

4. Conferir `public/sprites/nightmare-walker.gif`.
5. Rodar:

```powershell
npm run build
npm run lint
```

6. Fazer commit separado.

## Problemas comuns

- Se o personagem gira, o script esta usando `action: 8..15`. O correto e `action: 8` fixa e `frame: 0..7`.
- Se a roupa parece antiga, confira `outfit: 1`.
- Se o costume nao aparece, provavelmente foi usado item id no lugar de accessory id ou garment id.
- Se o cabelo esta na cor errada, ajustar `headPalette`.
- Se a roupa esta na cor errada, ajustar `bodyPalette`.

# Contributor identity map

> **Deliverable of [US-21.1](../sprints/stories/US-21.1-contributor-identity-map.md) — not a scratch note.** It is the lookup table `assignee` resolution depends on (email → GitHub login); it does not graduate and must not be deleted.

Canonical mapping from every git identity in this repository to exactly one GitHub
login. Story [US-21.1](../sprints/stories/US-21.1-contributor-identity-map.md).

The `assignee` field of every story must hold a login from the **Humans** table
below — never a `git user.name` (RULE-15).

- **123** name/email identities, **104** unique email addresses, **20,125** commits across all branches.
- **72** humans, **6** bots, **1** unresolved.

## How each login was resolved

Ordered by strength; each row of the table records which rule fired.

1. **noreply id** — a `<id>+<login>@users.noreply.github.com` address. The login it
   embeds is the one in force *when the commit landed*, so the map resolves the
   **numeric id** through `GET /user/{id}` instead. Three accounts had since been
   renamed (`NamPhamc99` → `nulllpc`, `carumusan` → `rosesopranodesertbat`,
   and `Are10`, now deleted).
2. **commit link** — `GET /repos/Koniverse/SubWallet-Extension/commits/{sha}` for a
   real commit bearing that email, reading `author.login`. This is used instead of
   `GET /commits?author=<email>`, which only searches the **default branch** and so
   reported ~1,700 branch-only commits as unattributable.
3. **email search** — the address is public on a GitHub profile.
4. **manual** — GitHub has no link because the address was never verified on the
   account. Every manual row carries its evidence in the table.

**Name matching was deliberately not used as a rule.** Three git names collide with
unrelated GitHub accounts: `lw` is [Luca Wehrstedt](https://github.com/lw) (the
commits are `lw-cdm`'s), `bluedot` is an Organization (the commits are
`bluezdot`'s), and `namph` is Nam Phung (the commits are `nulllpc`'s). Resolving
those three names to their same-named accounts would have misattributed
1,033 commits.

## Humans

| GitHub login | Commits | Other git names | Email addresses | Resolved by |
| --- | ---: | --- | --- | --- |
| [`saltict`](https://github.com/saltict) | 3506 | `AnhMTV`, `Peter Mai` | `maithachvietanh@gmail.com` | commit link |
| [`nulllpc`](https://github.com/nulllpc) | 2871 | `Nam Phạm`, `nampc`, `namph`, `NamPhamc99` | `namphamc99@gmail.com`<br>`44641118+namphamc99@users.noreply.github.com`<br>`nampc@foobla.com` | commit link, noreply id (renamed), manual |
| [`S2kael`](https://github.com/S2kael) | 2835 | — | `laiducminh1002@gmail.com`<br>`41369298+s2kael@users.noreply.github.com` | commit link, noreply id (renamed) |
| [`lw-cdm`](https://github.com/lw-cdm) | 1673 | `lw` | `linhtm@cdmteck.com`<br>`linhtm@konistudio.xyz`<br>`92499846+lw-cdm@users.noreply.github.com` | manual, commit link, noreply id |
| [`frenkie-ng`](https://github.com/frenkie-ng) | 1644 | `Frenkie Nguyen`, `nguyentiendung`, `frenkie`, `Dung Nguyen`, `dungnguyen-art` | `nguyentiendung.me@gmail.com`<br>`dungtpa2@gmail.com`<br>`duntpa2@gmail.com` | commit link, manual |
| [`bluezdot`](https://github.com/bluezdot) | 1509 | `bluedot` | `72647326+bluezdot@users.noreply.github.com`<br>`labidien2001@gmail.com`<br>`thanhtruong27701@gmail.com`<br>`bluedot@mbp-cua-bluedot.home` | noreply id, manual, commit link |
| [`tunghp2002`](https://github.com/tunghp2002) | 925 | — | `atsimet@gmail.com`<br>`126701975+tunghp2002@users.noreply.github.com` | commit link, noreply id |
| [`Thiendekaco`](https://github.com/Thiendekaco) | 909 | `0_0./` | `139972251+thiendekaco@users.noreply.github.com`<br>`thienguo@gmail.com`<br>`thiendekaco@gmail.com`<br>`thien.bt214099@sis.hust.edu.vn`<br>`thiendekaco@desktop-e49sv25.localdomain` | noreply id (renamed), manual, commit link |
| [`jacogr`](https://github.com/jacogr) | 639 | `Jaco` | `jacogr@gmail.com` | commit link |
| [`Quangdm-cdm`](https://github.com/Quangdm-cdm) | 540 | `quangdo`, `dominhquang`, `Dominhquangdev` | `quangdm@cdmteck.com`<br>`quangdm@subwallet.app`<br>`dominhquangdev1998@gmail.com`<br>`quangdo@konistudio.xyz`<br>`85857151+quangdm-cdm@users.noreply.github.com` | manual, commit link, noreply id (renamed) |
| [`PDTnhah`](https://github.com/PDTnhah) | 486 | `Thanh`, `pdthanh` | `phamduythanh43@gmail.com` | commit link |
| [`huukhai`](https://github.com/huukhai) | 144 | `khainh` | `huukhai0510@gmail.com` | commit link |
| [`TarikGul`](https://github.com/TarikGul) | 128 | `Tarik Gul` | `47201679+tarikgul@users.noreply.github.com`<br>`tariksnow37@gmail.com` | noreply id (renamed), commit link |
| [`LeeW0ng`](https://github.com/LeeW0ng) | 117 | `leewong`, `Lee Wong` | `linhtm@newayict.com` | commit link |
| [`hieudd`](https://github.com/hieudd) | 113 | `Hieu Dao` | `daodinhhieu@gmail.com` | commit link |
| [`Tbaut`](https://github.com/Tbaut) | 93 | `Thibaut Sardan` | `33178835+tbaut@users.noreply.github.com` | noreply id (renamed) |
| [`roman0211`](https://github.com/roman0211) | 63 | `Roman` | `romannguyen89@gmail.com` | commit link |
| [`ap211unitech`](https://github.com/ap211unitech) | 24 | `Arjun Porwal` | `65214523+ap211unitech@users.noreply.github.com` | noreply id |
| [`anhntk54`](https://github.com/anhntk54) | 22 | `anhnhu`, `trieunhu` | `anhnt@konistudio.xyz`<br>`anhnt@subwallet.app`<br>`anhntk54@gmail.com` | manual, commit link |
| [`phonglnDEV`](https://github.com/phonglnDEV) | 12 | `Phong Le Nhat` | `nhatphong9715@gmail.com` | commit link |
| [`bee344`](https://github.com/bee344) | 11 | `Alberto Nicolas Penayo` | `alberto.penayo@parity.io`<br>`74352651+bee344@users.noreply.github.com` | commit link, noreply id |
| [`F-OBrien`](https://github.com/F-OBrien) | 10 | `Francis O'Brien` | `42175565+f-obrien@users.noreply.github.com` | noreply id (renamed) |
| [`Trang2711`](https://github.com/Trang2711) | 10 | `Trang Trịnh` | `trinhtrang27112000@gmail.com` | commit link |
| [`minhle29`](https://github.com/minhle29) | 9 | `Minh Le` | `minh@foobla.com` | commit link |
| [`minhld1029`](https://github.com/minhld1029) | 9 | — | `minhld@foobla.com` | commit link |
| [`ryanleecode`](https://github.com/ryanleecode) | 9 | `Ryan Lee` | `ryan@parity.io`<br>`drdgvhbh@gmail.com` | commit link |
| [`minhle2994`](https://github.com/minhle2994) | 9 | `unknown`, `MinhLe` | `minhle2994@gmail.com` | commit link |
| [`vanruch`](https://github.com/vanruch) | 7 | `Ivan Rukhavets` | `ivanruch@gmail.com` | commit link |
| [`rajk93`](https://github.com/rajk93) | 5 | — | `raj@blockdeep.io` | commit link |
| [`amaury1093`](https://github.com/amaury1093) | 4 | `Amaury Martiny` | `amaury.martiny@protonmail.com` | commit link |
| [`joelamouche`](https://github.com/joelamouche) | 3 | `Antoine Estienne` | `estienne.antoine@gmail.com` | commit link |
| [`Quangdm-sw`](https://github.com/Quangdm-sw) | 3 | `quangdm` | `dominhquang4798@gmail.com` | commit link |
| [`0xrishitripathi`](https://github.com/0xrishitripathi) | 2 | — | `rishiotb123@gmail.com` | commit link |
| [`axelchalon`](https://github.com/axelchalon) | 2 | `Axel Chalon` | `xaxel@protonmail.com` | commit link |
| [`barrutko`](https://github.com/barrutko) | 2 | `Bartłomiej Rutkowski` | `bar.rutkow@gmail.com` | commit link |
| [`dudo50`](https://github.com/dudo50) | 2 | `Dusan Morhac` | `55763425+dudo50@users.noreply.github.com` | noreply id |
| [`Nick-1979`](https://github.com/Nick-1979) | 2 | `Kami` | `46442452+nick-1979@users.noreply.github.com` | noreply id (renamed) |
| [`ross-rosario`](https://github.com/ross-rosario) | 2 | `Remon Nashid` | `remon.sherin@gmail.com` | commit link |
| [`shawntabrizi`](https://github.com/shawntabrizi) | 2 | `Shawn Tabrizi` | `shawntabrizi@gmail.com` | commit link |
| [`WoeOm`](https://github.com/WoeOm) | 2 | — | `1015996366@qq.com` | commit link |
| [`ymittal`](https://github.com/ymittal) | 2 | `Yash Mittal` | `yashmittal2009@gmail.com` | commit link |
| [`rosesopranodesertbat`](https://github.com/rosesopranodesertbat) | 2 | `carumusan` | `879525+carumusan@users.noreply.github.com` | noreply id (renamed) |
| [`ccris02`](https://github.com/ccris02) | 2 | — | `66147586+ccris02@users.noreply.github.com` | noreply id |
| [`hamidra`](https://github.com/hamidra) | 2 | — | `hamid.alipour@gmail.com` | commit link |
| [`joepetrowski`](https://github.com/joepetrowski) | 2 | `joe petrowski` | `25483142+joepetrowski@users.noreply.github.com` | noreply id |
| [`itsonal`](https://github.com/itsonal) | 2 | `Sonal Banerjii` | `91733872+itsonal@users.noreply.github.com` | noreply id |
| [`BigBadAlien`](https://github.com/BigBadAlien) | 1 | `Aleksandr Ishchenko` | `bigbadalien@users.noreply.github.com` | noreply email |
| [`connect2amitu`](https://github.com/connect2amitu) | 1 | `Amit Chauhan` | `connect2amitu@gmail.com` | commit link |
| [`AndreiEres`](https://github.com/AndreiEres) | 1 | `Andrei Eres` | `eresav@me.com` | commit link |
| [`anhmtvoecsolution`](https://github.com/anhmtvoecsolution) | 1 | `AnhMTV` | `anhmtv@newayict.com` | commit link |
| [`achiurizo`](https://github.com/achiurizo) | 1 | `Arthur Chiu` | `24772+achiurizo@users.noreply.github.com` | noreply id |
| [`c410-f3r`](https://github.com/c410-f3r) | 1 | `Caio` | `c410.f3r@gmail.com` | commit link |
| [`Chakrarin`](https://github.com/Chakrarin) | 1 | `Chakrarin Sarnt` | `88219635+chakrarin@users.noreply.github.com` | noreply id (renamed) |
| [`Noc2`](https://github.com/Noc2) | 1 | `David Hawig` | `davidhawig@gmail.com` | commit link |
| [`yuzhiyou1990`](https://github.com/yuzhiyou1990) | 1 | `Forrest` | `zyyu1990@gmail.com` | commit link |
| [`Gioyik`](https://github.com/Gioyik) | 1 | `Giovanny Gongora` | `gioyik@gmail.com` | commit link |
| [`gdethier`](https://github.com/gdethier) | 1 | `Gérard Dethier` | `info@gerarddethier.be` | commit link |
| [`KarishmaBothara`](https://github.com/KarishmaBothara) | 1 | — | `bothara.karishma@gmail.com` | commit link |
| [`marceljay`](https://github.com/marceljay) | 1 | `Marcel Jackisch` | `jackisch@protonmail.com` | commit link |
| [`michaelhealyco`](https://github.com/michaelhealyco) | 1 | `Michael Healy` | `m@michaelhealy.co` | commit link |
| [`hlminh2000`](https://github.com/hlminh2000) | 1 | `Minh Ha` | `hlminh2000@gmail.com` | commit link |
| [`wirednkod`](https://github.com/wirednkod) | 1 | `Nikos Kontakis` | `wirednkod@gmail.com` | commit link |
| [`pedroapfilho`](https://github.com/pedroapfilho) | 1 | `Pedro Filho` | `pedro@filho.me` | commit link |
| [`n3wborn`](https://github.com/n3wborn) | 1 | `Stéphane P` | `n3wborn@protonmail.com` | commit link |
| [`tien`](https://github.com/tien) | 1 | `Tiến Nguyễn Khắc` | `tien.nguyenkhac@icloud.com` | commit link |
| [`chendatony31`](https://github.com/chendatony31) | 1 | `Tony Chen` | `31647753@qq.com` | commit link |
| [`Tore19`](https://github.com/Tore19) | 1 | — | `289649077@qq.com` | commit link |
| [`F3Joule`](https://github.com/F3Joule) | 1 | `Vlad Proshchavaiev` | `32250097+f3joule@users.noreply.github.com` | noreply id (renamed) |
| [`juliuscarvajal`](https://github.com/juliuscarvajal) | 1 | `f00` | `juliuscarvajal21@gmail.com` | commit link |
| [`zinderud`](https://github.com/zinderud) | 1 | `murat onur` | `mokosam@gmail.com` | commit link |
| [`roiLeo`](https://github.com/roiLeo) | 1 | — | `medina.leo42@gmail.com` | commit link |
| [`BubbleBear`](https://github.com/BubbleBear) | 1 | `雪霁` | `vesselvatel@gmail.com` | email search |

## Bots

Excluded from `assignee`. A story is never assigned to a bot.

| Identity | Commits | Email addresses |
| --- | ---: | --- |
| `github-actions[bot]` | 1407 | `action@github.com`<br>`41898282+github-actions[bot]@users.noreply.github.com` |
| `Automation Bot` | 211 | `bot@subwallet.app` |
| `Travis CI` | 99 | `(none)` |
| `dependabot[bot]` | 4 | `49699333+dependabot[bot]@users.noreply.github.com` |
| `greenkeeper[bot]` | 4 | `greenkeeper[bot]@users.noreply.github.com` |
| `copilot-swe-agent[bot]` | 3 | `198982749+copilot@users.noreply.github.com` |

## Orphans

Unresolvable: no GitHub account, no verified email, no owner confirmation. Left
unassigned rather than guessed.

| Git identity | Commits | Email | Why |
| --- | ---: | --- | --- |
| `CustomBlink` | 1 | `62216396+are10@users.noreply.github.com` | GitHub account deleted |

## Manual mappings and their evidence

| Email | Login | Evidence |
| --- | --- | --- |
| `linhtm@cdmteck.com` | `lw-cdm` | git name `lw-cdm`; org member; same person as linhtm@konistudio.xyz |
| `thienguo@gmail.com` | `Thiendekaco` | git name matches the login exactly |
| `thiendekaco@desktop-e49sv25.localdomain` | `Thiendekaco` | machine-local address; git name matches the login |
| `labidien2001@gmail.com` | `bluezdot` | git name `bluezdot`; org member |
| `bluedot@mbp-cua-bluedot.home` | `bluezdot` | machine-local address on bluezdot`s laptop |
| `quangdm@subwallet.app` | `Quangdm-cdm` | git name `Quangdm-cdm`; org member |
| `quangdm@cdmteck.com` | `Quangdm-cdm` | confirmed by repo owner; company address of the same person |
| `dominhquangdev1998@gmail.com` | `Quangdm-cdm` | confirmed by repo owner |
| `anhnt@konistudio.xyz` | `anhntk54` | confirmed by repo owner; org member matching local-part `anhnt` |
| `anhnt@subwallet.app` | `anhntk54` | confirmed by repo owner |
| `nampc@foobla.com` | `nulllpc` | confirmed by repo owner; `namph` is already an alias of nulllpc |
| `duntpa2@gmail.com` | `frenkie-ng` | confirmed by repo owner; one-character typo of dungtpa2@gmail.com |

## Maintenance

The map is a one-time reconstruction. New contributors add themselves as part of
their first PR: append a row to **Humans**, using the login from
`GET /user/{id}` rather than the login embedded in a noreply address.

Rebuild from scratch only if the history is rewritten — the resolution rules above
depend on commit SHAs staying stable.

# Vue Admin Plus UI Style Constraints

> Purpose: use this document as a front-end visual constraint guide when building the Zencas medical suite admin UI. The goal is to reproduce the observed Vue Admin Plus visual language as closely as possible through layout, spacing, colors, components, and interaction rules.

## Analysis Scope

- Source observed: `https://vuejs-core.cn/admin-plus/`
- Analysis date: 2026-06-07
- Observed pages: login page, dashboard home page, comprehensive table page.
- Note: the live demo redirects to a debugging restriction page in automated browser environments. The styles below were extracted from the public static build and a local render of the same build.
- Asset note: unless a proper license is available, do not directly reuse original proprietary images. Recreate equivalent backgrounds and panels with the same composition and visual weight.

## Master Prompt

Use this as the main style prompt for AI-assisted UI generation or design review:

```text
Build a Chinese enterprise admin dashboard in the style of Vue Admin Plus. Use a compact, engineering-focused middle/back-office UI, not a marketing page. The visual language should feel like Element Plus + Remix Icon + ECharts: clean white panels, pale gray workspace, fixed navigation, dense controls, and restrained visual decoration.

Use #1890ff as the primary color, #f6f8f9 as the page background, white content cards, 1px light borders, and a 5px base border radius. Avoid heavy shadows, oversized rounded corners, glassmorphism, large hero sections, decorative blobs, and purple gradient-heavy styling. The interface should feel functional, crisp, stable, and suitable for repeated operational use.
```

## Global Tokens

| Token | Value |
| --- | --- |
| Font family | `"PingFang SC", Arial, "Microsoft YaHei", sans-serif` |
| Base font size | `14px` |
| Body text | `#515a6e` |
| Primary text | `#303133` |
| Regular text | `#606266` |
| Secondary text | `#909399` |
| Page background | `#f6f8f9` |
| Card background | `#ffffff` |
| Table header background | `#f5f7fa` |
| Primary | `#1890ff` |
| Primary light | `#e8f4ff` |
| Success | `#13ce66` |
| Warning | `#ffba00` |
| Danger | `#ff4d4f` |
| Info | `#909399` |
| Border | `#dcdfe6` |
| Light border | `#e4e7ed` |
| Table border | `#ebeef5` |
| Base radius | `5px` |
| Base spacing | `20px` |

## Default Theme Settings

- Layout: `column`
- Theme name: `blue-black`
- Menu width: `266px`
- Column style: `card`
- Header: fixed
- Tabs: enabled
- Tabs style: `smooth`
- Theme setting drawer/floating entry: enabled
- Sidebar default collapse: false

Available primary theme variants:

| Theme | Primary |
| --- | --- |
| Blue | `#1890ff` |
| Green | `#41b584` |
| Purple | `#6954f0` |
| Red | `#f34d37` |

## Layout Constraints

- Body background must be `#f6f8f9`.
- Left navigation is fixed at `266px`.
- Main area starts at `margin-left: 266px`.
- Header area is fixed and `110px` high:
  - top nav: `60px`
  - tabs bar: `50px`
- Main content starts below the header and uses `padding: 20px`.
- Header and side navigation use subtle shadow: `0 1px 4px rgba(0, 21, 41, 0.08)`.
- Main app container must not use decorative section cards; only individual content panels should be card-like.
- Footer is white, `55px` high, centered, with text color `rgba(0,0,0,.45)`.

## Sidebar

The default sidebar is a column layout with a 64px dark primary icon rail and a white secondary menu area.

- Full sidebar width: `266px`.
- Logo area height: `60px`.
- Left icon rail width: `64px`.
- Dark rail background: `#282c34`.
- Dark rail text/icon color: `hsla(0,0%,100%,.95)`.
- Logo title area is white, title font size `20px`, line height `55px`.
- First-level column items are `64px` high with `5px` padding.
- Card-style column icon block: `54px x 54px`, radius `5px`.
- Secondary menu width is about `182px`.
- Menu item height: `50px`.
- Menu item padding: `0 20px`.
- Menu item margin-bottom: `5px`.
- Menu item radius: `5px`.
- Active menu background: `#e8f4ff`.
- Active menu text/icon: `#1890ff`.
- Normal menu text: `#303133`.

## Top Navigation

- Top nav height: `60px`.
- Background: white.
- Padding: `0 20px`.
- Shadow: `0 1px 4px rgba(0,21,41,.08)`.
- Left panel uses horizontal flex; contains collapse icon and breadcrumb.
- Collapse icon size: `16px`; color `rgba(0,0,0,.65)`; right margin `20px`.
- Breadcrumb line height: `60px`.
- Right panel uses horizontal flex and is right aligned.
- Utility icons are mostly `16px`; search icon is visually larger, about `22px`.
- Icon colors: `#666`, `#515a6e`, or `rgba(0,0,0,.65)`.
- Avatar size: `40px`, fully circular.
- Username block height: `40px`, line height `40px`, margin-left `6px`.

## Tabs Bar

- Tabs bar height: `50px`.
- Background: white.
- Padding: `0 20px`.
- Use the `smooth` tab style.
- Active tab height: about `40px`.
- Active tab background: `#e8f4ff`.
- Active tab color: `#1890ff`.
- Active tab font weight: `500`.
- Active tab padding: `0 20px 0 30px`.
- Tabs lightly overlap using negative right margin, producing a soft angled/pill feel.
- More icon color: `#9a9a9a`; size about `14px`.

## Cards

- Standard card background: white.
- Standard card border: `1px solid #e4e7ed`.
- Standard card radius: `5px`.
- Standard card shadow: none.
- Standard card overflow: hidden.
- Standard card margin-bottom: `20px`.
- Card header height: about `57px`.
- Card header padding: `18px 20px`.
- Card header border-bottom: `1px solid #e4e7ed`.
- Card body padding: `20px`.

Dashboard-specific cards:

- Welcome card min height: about `145px`.
- Welcome card body uses flex layout.
- Welcome avatar: `60px`, circular, margin-right `20px`.
- Welcome title: `20px`, weight `700`, color `#3c4a54`, line height `23px`.
- Welcome description: `14px`, color `#808695`, min height `20px`.
- Chart cards: about `268px` high.
- Shortcut icon cards: about `104px x 132px`.
- Shortcut icon size: `40px`, line height `46px`.
- Colorful project cards use `linear-gradient(50deg, #1890ff, #77e19d)`, white text, no shadow, radius `5px`.

## Tags

- Tag height: `24px`.
- Tag font size: `12px`.
- Tag padding: `0 9px`.
- Tag radius: `5px`.
- Primary tag: background `#e8f4ff`, border `#d1e9ff`, text `#1890ff`.
- Success tag: background `#f0f9eb`, border `#e1f3d8`, text `#13ce66`.
- Warning tag: background `#fdf6ec`, border `#faecd8`, text `#ffba00`.

## Buttons

- Default button height: `32px`.
- Button padding: `8px 15px`.
- Button radius: `5px`.
- Button font size: `14px`.
- Button font weight: `500`.
- Button transition: quick, around `0.1s`.
- Primary button: background and border `#1890ff`, text white.
- Primary plain button: background `#e8f4ff`, border `#8cc8ff`, text `#1890ff`.
- Danger button: background and border `#ff4d4f`, text white.
- Warning plain button: background `#fdf6ec`, border `#f3d19e`, text `#ffba00`.

## Forms

- Query forms use compact horizontal rows.
- Form item height: `32px`.
- Form item bottom margin: `10px`.
- Input and select height: `32px`.
- Input/select radius: `5px`.
- Input/select background: white.
- Input/select visual border: `box-shadow: 0 0 0 1px #dcdfe6 inset`.
- Input padding: `1px 11px`.
- Select padding: `4px 12px`.
- Labels should remain compact and aligned to the right in query forms.

## Tables

- Table page content panel is white with `padding: 20px`.
- Table height in the observed comprehensive table: about `319px`.
- Table background: white.
- Table header wrapper height: about `63px`.
- Table header background: `#f5f7fa`.
- Table header text: `#909399`.
- Table header font weight: `600`.
- Header cell padding: `8px 0`.
- Data row height: about `73.5px`.
- Data cell text: `#606266`.
- Cell bottom border: `1px solid #ebeef5`.
- Avoid oversized table controls; keep dense but readable.

## Pagination

- Pagination height: `32px`.
- Pagination margin-top: `20px`.
- Prev/next button background: `#f5f7fa`.
- Prev/next radius: `2px`.
- Page item size: `32px x 32px`.
- Page item margin: `0 4px`.
- Active page background: `#1890ff`.
- Active page text: white, weight `700`.
- Inactive page background: `#f0f2f5`.
- Inactive page text: `#303133`.

## Login Page

- Login page height: `100vh`.
- Background image behavior: `center fixed no-repeat`, `background-size: cover`.
- Background should feel like a cool blue/pale tech scene, not a flat gradient.
- Login form is positioned on the right.
- Observed desktop form: about `349px x 583px`.
- Login form margin: `calc(50vh - 277.5px) 5vw 5vw`.
- Login form padding: `4.5vh`.
- Form background uses a translucent panel image or equivalent custom panel with blue-tinted opacity.
- Main login title: `54px`, weight `500`, white.
- Subtitle: `26px`, weight `400`, white, margin-top `29px`.
- Login inputs: wrapper height `50px`; inner input height `48px`.
- Login input radius: `5px`.
- Login button: `220px x 50px`.
- Login button background: `#409eff`.
- Login button text: white.
- Login footer: fixed bottom `20px`, centered, white.

## Floating Theme Setting

- Fixed on the right edge, vertically centered.
- Width: `80px`.
- Observed height: about `292px`.
- Background: white.
- Border: `1px solid #dcdfe6`.
- Radius: `8px 0 0 8px`.
- Shadow: `0 0 50px rgba(82,63,105,.15)`.
- Z-index: about `1997`.
- Internal option cards are `60px x 60px`, radius `8px`.

## Interaction And Motion

- Default transitions should be subtle and fast.
- Common card transition: around `0.3s cubic-bezier(.645,.045,.355,1)`.
- Do not add bouncy animation or decorative motion.
- Hover states should usually change text color to primary or fill background to `#e8f4ff`.
- Avoid layout shift on hover.

## Negative Constraints

Do not:

- create a landing page or hero-style page for the app shell
- use oversized marketing cards
- use large rounded corners beyond the specified values
- use glassmorphism or heavy blur
- use strong shadows
- use decorative blobs, orbs, bokeh, or abstract gradient backgrounds
- use a purple-dominant palette unless explicitly selecting the purple theme
- make the UI too spacious; this is a dense operational admin system
- nest cards inside cards unless the inner card is an actual repeated item

## Development Checklist

Before shipping a page, verify:

- [ ] Body background is `#f6f8f9`.
- [ ] Sidebar width is `266px` and main content starts after it.
- [ ] Fixed header is `110px`; top nav is `60px`; tabs bar is `50px`.
- [ ] Main content uses `20px` padding.
- [ ] Cards use white background, `1px #e4e7ed` border, `5px` radius, no shadow.
- [ ] Buttons are `32px` high, `5px` radius, `8px 15px` padding.
- [ ] Inputs/selects are `32px` high with inset border shadow.
- [ ] Table header is `#f5f7fa`, header text `#909399`, body text `#606266`.
- [ ] Pagination is `32px` high and active page uses `#1890ff`.
- [ ] Text sizes stay close to the observed 14px base scale.
- [ ] No marketing-style hero, decorative blobs, heavy shadows, or oversized radii were introduced.

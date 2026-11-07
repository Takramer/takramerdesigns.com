// I10: the specimen sheet a brand case opens on (Thomas picked A, assemble, 5 November; lab/i10).
// Colors were sampled from each project's own artwork, not chosen: OperationsHERO from the logo
// suite slide, Healthy Campus Week from the week TV screen, Love Your Body Week from the web banner,
// The Flavor Scroll from the home screen. Type is a crop of the project's own set type, since the
// faces are not licensed for this site. detail: a crop of the project's own artwork at its full size
// (src/assets/sheets). Good Word has no fixed palette (each week has its own), so it has no sheet.
export interface Sheet {
  ground: string
  ink: string
  chips: string[]
  type: string
  detail: string
  // The mark's fill; Love Your Body Week's letters run green to violet, so its mark does too.
  fill?: string[]
}

export const SHEETS: Record<string, Sheet> = {
  operationshero: {
    ground: '#FFFAED', ink: '#011627', chips: ['#011627', '#FFFAED', '#86BBD8', '#FF7F11'],
    type: 'sheets/operationshero-type.png', detail: 'sheets/operationshero-detail.png',
  },
  'healthy-campus-week': {
    ground: '#FFF7E1', ink: '#000000', chips: ['#000000', '#FFF7E1', '#85C07C', '#76A6C1', '#E4841C', '#E38FC5', '#DB0F23'],
    type: 'sheets/healthy-campus-week-type.png', detail: 'sheets/healthy-campus-week-detail.png',
  },
  'love-your-body-week': {
    ground: '#CFCEF3', ink: '#141414', chips: ['#49A37C', '#4EC0C9', '#62A1D8', '#A96AF3', '#CFCEF3'],
    type: 'sheets/love-your-body-week-type.png', detail: 'sheets/love-your-body-week-detail.png', fill: ['#49A37C', '#4EC0C9', '#62A1D8', '#A96AF3'],
  },
  'the-flavor-scroll': {
    ground: '#FFFAFB', ink: '#00100B', chips: ['#00100B', '#FFFAFB', '#FBF7BE', '#F89855', '#F84716', '#FF3E3C'],
    type: 'sheets/the-flavor-scroll-type.png', detail: 'sheets/the-flavor-scroll-detail.png',
  },
}


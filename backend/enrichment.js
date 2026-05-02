// ── CampusScout Enrichment Table ──────────────────────────────────────────
// Real 2025/2026 ranking data for top ~250 schools
// Sources: US News 2026, WSJ 2026, Niche 2026, Forbes 2025, LinkedIn 2025,
//          Poets & Quants 2025
//
// Format per school (Scorecard ID as key):
// [usnews, wsj, niche, forbes, linkedin, pq, safety, campus_beauty, greek_life, alumni_loyalty]
//
// Score scale 1-10:
//   usnews: rank 1-5=10, 6-10=9, 11-20=8, 21-35=7, 36-50=6, 51-75=5, 76-100=4, 101-150=3, 150+=2
//   wsj:    rank 1-5=10, 6-15=9, 16-30=8, 31-50=7, 51-75=6, 76-100=5, 100+=4
//   niche:  A+=10, A=8, A-=7, B+=6, B=5, B-=4, C+=3
//   forbes: top25=10, 26-50=9, 51-100=8, 101-150=7, 151-250=6, 250+=5
//   linkedin: rank 1-5=10, 6-15=9, 16-25=8, 26-35=7, 36-50=6, unranked=4
//   pq:     top5=10, 6-15=9, 16-30=8, 31-50=7, 51-75=6, 76-100=5, 100+=4, 0=N/A
//   safety: A+=10, A=9, A-=8, B+=7, B=6, B-=5, C+=4, C=3
//   campus_beauty: A+=10, A=9, A-=8, B+=7, B=6, B-=5
//   greek_life: A+=10, A=9, A-=8, B+=7, B=6, B-=5, C=4, none=2
//   alumni_loyalty: A+=10, A=9, A-=8, B+=7, B=6, B-=5

const ENRICHMENT = {

  // ── IVY LEAGUE ───────────────────────────────────────────────────────────
  182670: [10,10,10,10,10, 0, 9,10, 7,10], // Princeton       UN#1  WSJ#4  LinkedIn#1
  166683: [10, 9,10,10,10, 0, 9, 8, 5,10], // MIT             UN#2  WSJ#11 LinkedIn#4
  166027: [10, 9,10,10, 9, 0, 9, 9, 6,10], // Harvard         UN#3  WSJ#5  LinkedIn#6
  243744: [10,10,10,10, 9, 0, 9,10, 7,10], // Yale            UN#4  WSJ#3  LinkedIn#19
  243757: [10,10,10,10,10, 0, 9, 9, 7,10], // Stanford        UN#4  WSJ#1  LinkedIn#10
  215062: [10, 9,10,10,10,10, 8, 8, 8,10], // UPenn/Wharton   UN#7  WSJ#9  LinkedIn#3  PQ#1
  181464: [ 9, 7, 9, 9,10, 0, 8, 9, 8, 9], // Duke            UN#7  WSJ#68 LinkedIn#2
  162928: [ 9, 5, 9, 8, 0, 0, 9, 7, 6, 9], // Johns Hopkins   UN#7  LinkedIn not top50
  147767: [ 9, 7, 9, 9, 9, 0, 8, 7, 7, 9], // Northwestern    UN#7  WSJ#50 LinkedIn#11
  190150: [ 8, 9, 9, 9, 9, 0, 8,10, 7, 9], // Cornell         UN#12 WSJ#18 LinkedIn#5
  217156: [ 8, 8, 9, 9, 8, 0, 8, 8, 5, 9], // Brown           UN#13 WSJ#27 LinkedIn#14
  182281: [ 8, 7, 9, 9, 9, 0, 9, 9, 6, 9], // Dartmouth       UN#13 WSJ#47 LinkedIn#9
  130794: [ 8, 8, 9, 9, 8, 0, 6, 7, 5, 9], // Columbia        UN#15 WSJ#8  LinkedIn#18

  // ── TOP 20 NATIONAL ──────────────────────────────────────────────────────
  166629: [ 9, 8, 9,10, 9, 0, 9, 7, 4, 9], // Caltech         UN#11 WSJ#23 LinkedIn#41
  144050: [ 9, 8, 9, 9, 7, 0, 8, 7, 4, 9], // U Chicago       UN#6  WSJ#30 LinkedIn#26
  126614: [ 8, 5, 9, 9, 0, 0, 7, 9, 7, 8], // UCLA            UN#15 WSJ#80 (not top50 LI)
  110635: [ 8, 9, 9, 9, 7, 0, 6, 9, 7, 9], // UC Berkeley     UN#15 WSJ#7  LinkedIn#30
  150900: [ 8, 8, 9, 9, 8, 8, 9, 9, 8, 9], // Notre Dame      UN#20 WSJ#20 LinkedIn#8  PQ top20
  179867: [ 7, 8, 9, 9, 0, 9, 8, 8, 8, 9], // Wash U St Louis UN#20 WSJ#39 PQ top20
  215293: [ 7, 5, 8, 8, 8, 0, 7, 7, 5, 8], // Carnegie Mellon UN#20 WSJ#46 LinkedIn#20

  // ── TOP 20-35 NATIONAL ───────────────────────────────────────────────────
  131469: [ 7, 6, 9, 8, 8, 0, 8,10, 7, 9], // Georgetown      UN#22 WSJ#53 LinkedIn#32
  221759: [ 7, 7, 9, 9, 8, 0, 8, 8, 9, 9], // Vanderbilt      UN#22 WSJ#34 LinkedIn#13
  166500: [ 7, 5, 8, 8, 8, 0, 8, 7, 6, 8], // Tufts           UN#22 LinkedIn#16
  229115: [ 7, 8, 9, 9, 7, 0, 8, 9, 7, 9], // Rice            UN#17 WSJ#26 LinkedIn#31
  197708: [ 7, 5, 8, 8, 0, 0, 7, 7, 5, 8], // NYU             UN#30 LinkedIn not top50

  // ── STRONG BUSINESS/SPECIALTY ────────────────────────────────────────────
  147703: [ 5,10, 8, 9,10,10, 8, 7, 4, 9], // Babson          WSJ#2  LinkedIn#7  PQ#1
  164739: [ 4, 9, 7, 8, 9, 8, 7, 7, 4, 8], // Bentley         WSJ#12 LinkedIn#15 PQ top30
  211291: [ 6, 8, 8, 8, 8, 8, 8, 8, 8, 8], // Lehigh          UN#36  WSJ#29 LinkedIn#17 PQ top30
  215365: [ 6, 5, 8, 8, 8, 9, 8, 8, 8, 9], // Villanova       UN#46  WSJ#95 LinkedIn#23 PQ#12
  164988: [ 6, 5, 8, 8, 8, 9, 8, 9, 7, 9], // Boston College  UN#36  LinkedIn#22 PQ top20
  168148: [ 6, 5, 8, 8, 5, 7, 7, 7, 5, 8], // Northeastern    UN#46  PQ top50
  190512: [ 5, 7, 7, 7, 0, 8, 7, 5, 4, 7], // CUNY Baruch     WSJ#44 PQ top15
  164924: [ 5, 5, 8, 7, 6, 7, 7, 7, 6, 8], // Boston Univ     UN#64  LinkedIn#43

  // ── TOP 35-60 NATIONAL ───────────────────────────────────────────────────
  234076: [ 7, 8, 9, 9, 8, 0, 8, 9, 9, 9], // UVA             UN#22  WSJ#31 LinkedIn#12
  240444: [ 7, 8, 9, 9, 7, 8, 8, 9, 7, 9], // U Michigan      UN#26  WSJ#25 LinkedIn#34 PQ top25
  199120: [ 6, 5, 8, 7, 0, 0, 8, 8, 9, 8], // UNC Chapel Hill UN#29
  204796: [ 6, 5, 8, 7, 0, 0, 7, 8, 9, 8], // Ohio State      UN#36
  228778: [ 6, 7, 8, 8, 7, 0, 7, 7, 8, 8], // UT Austin       UN#36  WSJ#49 LinkedIn#46
  228723: [ 5, 8, 8, 7, 0, 0, 7, 7, 8, 8], // Texas A&M       UN#64  WSJ#33
  139959: [ 6, 8, 8, 8, 0, 0, 7, 7, 7, 8], // Georgia Tech    UN#36  WSJ#16
  186380: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // Rutgers         UN#64
  161004: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // U Maryland      UN#64
  145637: [ 5, 7, 8, 7, 7, 0, 7, 7, 7, 8], // U Illinois      UN#46  WSJ#55 LinkedIn#24
  232186: [ 6, 8, 8, 7, 0, 0, 8, 7, 7, 8], // Virginia Tech   UN#51  WSJ#35
  153603: [ 5, 5, 7, 7, 7, 0, 7, 7, 6, 7], // Purdue          UN#64  LinkedIn#33
  122597: [ 5, 7, 8, 7, 0, 0, 7, 8, 5, 7], // UC San Diego    UN#29  WSJ#41
  110680: [ 5, 8, 8, 7, 0, 0, 7, 8, 5, 7], // UC Davis        UN#36  WSJ#13
  110671: [ 5, 6, 7, 7, 0, 0, 7, 7, 5, 7], // UC Irvine       UN#36  WSJ#48
  110653: [ 5, 5, 7, 7, 0, 0, 7, 7, 5, 7], // UC Santa Barbara UN#36
  236939: [ 5, 5, 7, 7, 0, 0, 7, 8, 5, 7], // U Washington    UN#51

  // ── STRONG LIBERAL ARTS ──────────────────────────────────────────────────
  211440: [ 8, 5, 9, 9, 0, 0,10, 9, 5, 9], // Williams        LA#1
  151351: [ 8, 5, 9, 9, 0, 0, 9, 9, 5, 9], // Amherst         LA#2
  130697: [ 8, 5, 9, 8, 0, 0, 8, 9, 6, 9], // Wesleyan        LA#14
  130226: [ 8, 5, 9, 9, 0, 0, 9,10, 5, 9], // Middlebury      LA#4
  193900: [ 7, 8, 8, 8, 7, 0, 9, 9, 8, 9], // Colgate         UN#86  WSJ#40 LinkedIn#36
  196264: [ 7, 5, 8, 8, 0, 0, 9, 9, 6, 8], // Vassar          LA#10
  140553: [ 7, 5, 8, 8, 0, 0, 9, 9, 4, 8], // Pomona          LA#4
  186584: [ 7, 5, 8, 8, 0, 0, 9, 8, 5, 8], // Swarthmore      WSJ#24 LA#3
  175342: [ 7, 5, 8, 8, 0, 0, 9, 8, 4, 8], // Carleton        LA#7
  163286: [ 7, 8, 8, 8, 0, 0, 9, 9, 5, 8], // Bowdoin         LA#4
  127918: [ 7, 8, 8, 8, 0, 0,10, 9, 5, 9], // Claremont McKenna WSJ#6 LA#8
  162584: [ 7, 7, 8, 8, 0, 0, 9, 9, 5, 8], // Hamilton        LA#14
  168342: [ 6, 5, 8, 8, 0, 0, 9, 8, 4, 8], // Oberlin         LA#27
  194310: [ 7, 5, 8, 8, 0, 0, 9, 8, 5, 8], // Skidmore        LA#49
  211352: [ 7, 5, 8, 8, 0, 0, 9, 8, 5, 8], // Trinity (PA)    LA#37
  207388: [ 6, 5, 7, 7, 0, 0, 9, 8, 5, 8], // Reed College    LA#86
  212911: [ 7, 5, 8, 8, 0, 0, 9, 8, 5, 8], // Bucknell        WSJ#90 LA#21
  234030: [ 7, 5, 8, 8, 0, 0, 9, 9, 7, 8], // Washington & Lee WSJ#61 LinkedIn#29

  // ── TOP 50-100 NATIONAL ──────────────────────────────────────────────────
  197984: [ 6, 5, 8, 8, 8, 0, 8, 9, 8, 8], // Wake Forest     UN#46  LinkedIn#25
  139755: [ 6, 5, 8, 8, 0, 8, 7, 8, 8, 8], // Emory           UN#26  PQ top25
  206084: [ 5, 5, 7, 7, 7, 0, 7, 7, 8, 7], // Penn State      UN#75  LinkedIn#40
  204024: [ 5, 5, 7, 7, 7, 0, 7, 7, 7, 7], // Miami U Ohio    UN#86  LinkedIn#35
  216010: [ 5, 5, 7, 7, 7, 0, 8, 8, 8, 8], // SMU             LinkedIn#37
  168421: [ 4, 5, 6, 6, 0, 7, 7, 7, 5, 6], // UMass Amherst   PQ#46
  192448: [ 4, 5, 7, 7, 0, 6, 7, 7, 8, 7], // Syracuse        UN#86
  166692: [ 6, 5, 8, 7, 0, 0, 8, 8, 4, 7], // Brandeis        UN#60
  132903: [ 5, 5, 7, 7, 0, 6, 7, 9, 7, 7], // U Miami         UN#64  PQ top60
  123961: [ 8, 7, 9, 9, 7, 8, 7, 9, 9, 9], // USC             UN#28  WSJ#37 LinkedIn#27 PQ top30
  217484: [ 4, 5, 6, 5, 6, 5, 8, 7, 6, 7], // Providence Coll LinkedIn#49
  217538: [ 4, 5, 6, 7, 7, 7, 7, 7, 6, 7], // Bryant          WSJ#96 LinkedIn#38 PQ top50
  185828: [ 5, 5, 6, 6, 0, 7, 7, 6, 4, 6], // NJIT            WSJ#84 PQ top75
  194824: [ 4, 5, 6, 6, 0, 6, 6, 6, 6, 6], // Drexel          PQ#67
  217819: [ 3, 6, 5, 5, 0, 5, 7, 7, 6, 6], // Quinnipiac      WSJ#51
  142285: [ 5, 5, 7, 6, 0, 0, 8, 9, 7, 7], // U Colorado      UN#86
  173258: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // U Minnesota     UN#64
  240727: [ 5, 6, 7, 7, 7, 0, 7, 8, 7, 7], // U Wisconsin     UN#86  WSJ#94 LinkedIn#50
  199193: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // NC State        UN#75
  209551: [ 5, 5, 7, 6, 0, 0, 8, 9, 6, 7], // U Oregon        UN#97
  228769: [ 4, 5, 6, 6, 0, 0, 7, 7, 7, 6], // Texas Tech      UN#115
  130183: [ 5, 5, 7, 7, 0, 6, 7, 7, 6, 8], // Fordham         PQ#70
  186867: [ 5, 5, 6, 6, 7, 0, 7, 6, 4, 6], // Stevens Tech    LinkedIn#45
  196088: [ 5, 5, 6, 6, 0, 0, 8, 8, 7, 7], // RPI             UN#86
  153658: [ 5, 7, 7, 7, 7, 0, 8, 9, 7, 8], // Santa Clara     WSJ#91 LinkedIn(honorable)
  221838: [ 5, 7, 7, 7, 0, 0, 7, 7, 7, 7], // U Delaware      WSJ#38
  209542: [ 5, 5, 7, 7, 7, 0, 8, 8, 6, 7], // U Portland      WSJ#86 LinkedIn(regional)
  150136: [ 5, 5, 7, 7, 7, 0, 8, 9, 9, 8], // Indiana Univ    UN#75  LinkedIn#47
  215105: [ 5, 5, 7, 7, 7, 0, 8, 8, 8, 7], // Penn State UP   LinkedIn#40
  182290: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // Rutgers Newark  UN
  147536: [ 5, 7, 7, 7, 0, 0, 7, 8, 6, 7], // U Florida       UN#75  WSJ#72
  126818: [ 5, 5, 7, 7, 0, 0, 7, 8, 5, 7], // UC Riverside    WSJ#57
  110662: [ 5, 7, 7, 7, 0, 0, 7, 7, 5, 7], // UC Santa Cruz   WSJ#28 (Cal Poly)
  // Cal Poly SLO
  110422: [ 5, 7, 7, 7, 0, 0, 7, 9, 7, 7], // Cal Poly SLO    WSJ#28

  // ── NORTHEAST REGIONAL STRONG SCHOOLS ───────────────────────────────────
  130253: [ 3, 5, 6, 6, 0, 0, 8, 7, 5, 6], // Fairfield       WSJ#81 LinkedIn#28
  209612: [ 4, 5, 6, 6, 7, 0, 8, 8, 6, 7], // Univ of Richmond LinkedIn#44
  131496: [ 3, 5, 5, 5, 0, 0, 7, 6, 6, 6], // Quinnipiac alt
  193654: [ 4, 5, 6, 6, 7, 0, 8, 7, 7, 7], // WPI Worcester   LinkedIn#39
  148584: [ 5, 5, 6, 6, 0, 0, 7, 7, 7, 7], // Marquette       WSJ#82
  // Loyola Maryland
  166408: [ 4, 9, 6, 6, 0, 0, 8, 7, 7, 7], // Loyola Maryland WSJ#19

  // ── ADDITIONAL TOP SCHOOLS ───────────────────────────────────────────────
  170082: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // Michigan State  UN#64
  181002: [ 5, 5, 7, 7, 0, 0, 7, 7, 8, 7], // U Nebraska
  104151: [ 5, 5, 7, 7, 0, 0, 7, 8, 8, 7], // Arizona State
  104179: [ 5, 5, 7, 7, 0, 0, 7, 8, 7, 7], // U Arizona
  126580: [ 5, 5, 7, 7, 0, 0, 7, 8, 6, 7], // UC Davis alt
  137351: [ 5, 5, 6, 6, 0, 0, 7, 7, 8, 7], // U Florida alt
  139658: [ 5, 5, 7, 7, 0, 0, 7, 8, 9, 7], // Georgia U       UN#57
  142115: [ 5, 5, 7, 7, 0, 0, 7, 8, 7, 7], // Colorado State
  145600: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // U Illinois Chi
  155317: [ 5, 5, 6, 6, 0, 0, 7, 7, 7, 6], // U Kansas
  157085: [ 5, 5, 7, 7, 0, 0, 7, 8, 9, 7], // LSU
  163286: [ 7, 5, 8, 8, 0, 0, 9, 9, 5, 8], // Bowdoin dup
  163453: [ 5, 5, 6, 6, 0, 0, 7, 7, 5, 6], // U Maine
  164562: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // Assumption
  166027: [10, 9,10,10, 9, 0, 9, 9, 6,10], // Harvard dup - ok
  174066: [ 5, 5, 7, 7, 0, 0, 7, 8, 7, 7], // U Mississippi   UN#86
  176017: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // Missouri S&T
  178411: [ 5, 5, 7, 7, 0, 0, 7, 8, 7, 7], // U Missouri
  178396: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // Missouri
  183044: [ 5, 5, 7, 7, 0, 0, 8, 8, 6, 7], // U New Hampshire
  186131: [ 4, 5, 6, 6, 0, 0, 7, 7, 6, 6], // Seton Hall
  196413: [ 4, 5, 6, 6, 0, 0, 7, 7, 6, 6], // Syracuse alt
  199120: [ 6, 5, 8, 7, 0, 0, 8, 8, 9, 8], // UNC dup
  200280: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // Bowling Green
  201441: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // Cleveland State
  204157: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // Dayton U
  211440: [ 8, 5, 9, 9, 0, 0,10, 9, 5, 9], // Williams dup
  212160: [ 6, 5, 8, 7, 0, 0, 8, 8, 8, 8], // Lafayette       WSJ#56 LinkedIn#48
  212577: [ 5, 5, 7, 7, 0, 0, 8, 8, 7, 7], // Muhlenberg
  213543: [ 5, 5, 7, 7, 0, 0, 8, 7, 6, 7], // Penn (regional)
  215770: [ 5, 5, 7, 7, 0, 0, 7, 8, 6, 7], // Pittsburgh
  216597: [ 5, 5, 6, 6, 0, 0, 7, 7, 7, 7], // Point Park
  217013: [ 4, 5, 6, 6, 0, 0, 7, 7, 6, 7], // Robert Morris
  218070: [ 5, 5, 7, 7, 0, 0, 8, 9, 5, 7], // Dickinson       (study abroad)
  219356: [ 5, 5, 7, 7, 0, 0, 8, 8, 6, 7], // Temple
  221999: [ 4, 5, 5, 5, 0, 0, 7, 7, 6, 6], // Lipscomb
  222831: [ 5, 7, 7, 7, 0, 0, 8, 8, 7, 7], // Belmont
  225432: [ 5, 5, 7, 7, 0, 0, 7, 8, 8, 7], // UT Dallas       UN#115
  226152: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // TCU             UN#97
  227368: [ 5, 7, 7, 7, 0, 0, 7, 7, 6, 7], // Baylor          UN#97
  228246: [ 5, 5, 7, 7, 0, 0, 8, 9, 7, 7], // Trinity San Antonio
  228459: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // Texas Christian WSJ(tied)
  229115: [ 7, 8, 9, 9, 7, 0, 8, 9, 7, 9], // Rice dup
  230764: [ 5, 5, 7, 7, 0, 0, 8, 9, 7, 7], // U Utah          WSJ#78
  232557: [ 5, 7, 7, 7, 0, 0, 7, 7, 6, 7], // George Mason    WSJ#71
  234207: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // James Madison
  234827: [ 4, 5, 6, 6, 0, 0, 7, 7, 6, 6], // Liberty
  236328: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // Old Dominion
  237011: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // William & Mary  UN#46
  239105: [ 5, 5, 7, 7, 0, 0, 7, 7, 6, 7], // U Vermont
  240189: [ 5, 5, 7, 7, 0, 0, 7, 7, 5, 7], // Marquette dup
  243780: [ 5, 5, 7, 7, 0, 0, 7, 7, 7, 7], // Quinnipiac dup
  209548: [ 5, 5, 7, 7, 7, 0, 7, 7, 5, 7], // U of Pacific    WSJ#85
};

// Niche grade → score
function nicheGrade(g) {
  const m = {'A+':10,'A':8,'A-':7,'B+':6,'B':5,'B-':4,'C+':3,'C':3};
  return m[g] || 5;
}

// Enrich a school object with real ranking scores
function enrich(school) {
  const e = ENRICHMENT[school.scorecardId];
  if (!e) return school;

  const [usnews, wsj, niche, forbes, linkedin, pq, safety, campus_beauty, greek_life, alumni_loyalty] = e;

  return {
    ...school,
    data: {
      ...school.data,
      usnews_rank:    usnews    || school.data.usnews_rank,
      wsj_rank:       wsj       || school.data.wsj_rank,
      niche_rank:     niche     || school.data.niche_rank,
      forbes_rank:    forbes    || school.data.forbes_rank,
      linkedin_rank:  linkedin  || school.data.linkedin_rank,
      pq_rank:        pq > 0    ? pq : school.data.pq_rank,
      finance_rank:   pq > 0    ? pq : school.data.finance_rank,
      safety:         safety    || school.data.safety,
      campus_beauty:  campus_beauty  || school.data.campus_beauty,
      greek_life:     greek_life     || school.data.greek_life,
      alumni_loyalty: alumni_loyalty || school.data.alumni_loyalty,
    }
  };
}

module.exports = { enrich, ENRICHMENT };

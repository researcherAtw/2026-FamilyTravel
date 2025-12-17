
import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Card, Button, CategoryBadge } from './UI';
import { ScheduleItem, Booking, HighlightTag, HighlightColor, WeatherInfo } from '../types';

// --- MOCK DATA ---
const MOCK_SCHEDULE: ScheduleItem[] = [
  // --- 2/15 (Sun) Day 1: TPE -> DXB -> PRG ---
  { 
      id: 'd1-1', date: '2026-02-15', time: '00:20', displayTime: '00:20',
      title: '起飛', enTitle: 'Departure', location: 'TPE 桃園機場', category: 'transport', categoryColor: 'red',
      description: '往 DXB 杜拜機場'
  },
  { 
      id: 'd1-2', date: '2026-02-15', time: '06:15', displayTime: '06:15',
      title: '降落', enTitle: 'Arrival', location: 'DXB 杜拜機場', category: 'transport', categoryColor: 'red'
  },
  { 
      id: 'd1-3', date: '2026-02-15', time: '08:40', displayTime: '08:40',
      title: '起飛 (轉機)', enTitle: 'Transfer Departure', location: 'DXB 杜拜機場', category: 'transport', categoryColor: 'red',
      description: '往 PRG 布拉格'
  },
  { 
      id: 'd1-4', date: '2026-02-15', time: '12:30', displayTime: '12:30',
      title: '降落', enTitle: 'Arrival', location: 'PRG 布拉格機場', category: 'transport', categoryColor: 'red',
      description: '瓦茨拉夫·哈維爾國際機場'
  },
  { 
      id: 'd1-5', date: '2026-02-15', time: '14:00', 
      title: '老城廣場', enTitle: 'Old Town Square', location: '布拉格舊城區 (Staré Město)', category: '下車參觀', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/uP6g3nF8J8j6J8j6',
      guideInfo: {
          story: "自12世紀以來，這裡就是中歐最重要的市集廣場，是商貿路線的十字路口。",
          tip: "舊市政廳的塔樓是俯瞰廣場全景、拍攝泰恩教堂日落美景的最佳地點（有電梯）。",
          highlights: [
              { id: 'h1', text: '舊市政廳', color: 'red' },
              { id: 'h2', text: '泰恩教堂', color: 'purple' },
              { id: 'h3', text: '天文鐘', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd1-6', date: '2026-02-15', time: '15:00', 
      title: '火藥塔', enTitle: 'Powder Tower', location: '共和國廣場 (Náměstí Republiky)', category: '下車參觀', categoryColor: 'green',
      mapUrl: 'https://maps.app.goo.gl/uP6g3nF8J8j6J8j6',
      guideInfo: {
          story: "這座晚期哥德式塔樓始建於1475年，是布拉格舊城區的13座城門之一。",
          tip: "塔樓內部有展覽並開放登頂（需爬186級旋轉樓梯）。火藥塔旁邊緊鄰著華麗的「市民會館」(Municipal House)，是布拉格新藝術運動風格的巔峰之作。",
          highlights: [
              { id: 'h1', text: '登塔186階', color: 'blue' },
              { id: 'h2', text: '市民會館', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd1-7', date: '2026-02-15', time: '16:00', 
      title: '布拉格天文鐘', enTitle: 'Prague Astronomical Clock', location: '舊市政廳南牆', category: '入場卷', categoryColor: 'red',
      mapUrl: 'https://maps.app.goo.gl/uP6g3nF8J8j6J8j6',
      guideInfo: {
          story: "位於舊市政廳的南面牆上，是廣場的靈魂。",
          tip: "請務必在「整點」前10-15分鐘卡位，觀賞長達45秒的耶穌十二門徒報時秀。",
          highlights: [
              { id: 'h1', text: '整點報時', color: 'red' },
              { id: 'h2', text: '耶穌十二門徒', color: 'green' },
              { id: 'h3', text: '可動式天文鐘冰箱貼', color: 'purple' }
          ]
      }
  },

  // --- 2/16 (Mon) Day 2: Prague ---
  { 
      id: 'd2-1', date: '2026-02-16', time: '09:00', 
      title: '查理士大橋', enTitle: 'Charles Bridge', location: '伏爾塔瓦河 (Vltava)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "這座橋是捷克最著名的地標，始建於一三五七年，由查理四世皇帝奠基（傳說他當時諮詢了天文學家，選擇了一三五七年九月七日五點三十一分這個「迴文」吉時）。",
          tip: "找到雕像底座的兩塊青銅浮雕（一塊描繪聖約翰被丟下河，另一塊是騎士與狗），據說觸摸它們會帶來好運，並確保您能再次回到布拉格。",
          highlights: [
              { id: 'h1', text: '聖約翰雕像', color: 'purple' },
              { id: 'h2', text: '觸摸幸運符', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd2-2', date: '2026-02-16', time: '10:30', 
      title: '布拉格古堡', enTitle: 'Prague Castle', location: '城堡區 (Hradčany)', category: '入場卷', categoryColor: 'red',
      guideInfo: {
          story: "這不是一座單一城堡，而是金氏世界紀錄認證的「世界上最大的古堡建築群」。",
          tip: "參觀主要景點需購買套票(Circuit B)。務必入內欣賞聖維特大教堂中慕夏(Alfons Mucha)設計的彩繪玻璃窗。每天中午12點在正門有衛兵交接。",
          highlights: [
              { id: 'h1', text: '聖維特大教堂', color: 'purple' },
              { id: 'h2', text: '衛兵交接', color: 'red' },
              { id: 'h3', text: 'Circuit B', color: 'gray' }
          ]
      }
  },
  { 
      id: 'd2-3', date: '2026-02-16', time: '13:00', 
      title: '黃金小徑', enTitle: 'Golden Lane', location: '城堡區 (Hradčany)', category: '入場卷', categoryColor: 'red',
      guideInfo: {
          story: "這條位於城堡圍牆內的小徑，最初建於16世紀末，是城堡守衛和僕人的居所。\n\n著名作家卡夫卡 (Franz Kafka) 曾在1916至1917年間，於水藍色的「22號」房舍短暫居住並進行創作。",
          tip: "現在小房子內部被改造成各種主題展覽。通常在下午5點（冬季4點）城堡展館關閉後，黃金小徑會開放免費進入。",
          highlights: [
              { id: 'h1', text: 'No.22 卡夫卡', color: 'blue' },
              { id: 'h2', text: '免費時段', color: 'green' }
          ]
      }
  },
  { 
      id: 'd2-4', date: '2026-02-16', time: '15:00', 
      title: '伏爾他瓦河遊船', enTitle: 'Vltava River Cruise', location: '什切廷碼頭', category: '入場卷', categoryColor: 'red',
      guideInfo: {
          story: "伏爾他瓦河是捷克的「母親河」，也是捷克民族精神的象徵。",
          tip: "靠近卡夫卡博物館的地方是著名的「天鵝餵食點」。在新城區一側的河岸 (Náplavka) 則是當地人週末喜愛的農夫市集與酒吧聚集地。",
          highlights: [
              { id: 'h1', text: '遊船體驗', color: 'blue' },
              { id: 'h2', text: '天鵝餵食點', color: 'gray' },
              { id: 'h3', text: '河岸酒吧', color: 'orange' }
          ]
      }
  },

  // --- 2/17 (Tue) Day 3: Prague ---
  { 
      id: 'd3-1', date: '2026-02-17', time: '09:00', 
      title: '捷克郵政總局', enTitle: 'Czech Post Office', location: '布拉格新城 (Nové Město)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "建於1871-1874年，採用宏偉的新文藝復興風格。內部有表現通訊歷史的壁畫。",
          tip: "至今仍是正常運作的郵局，可免費進入大廳參觀。不妨在此購買郵票並寄出您的明信片體驗歷史。",
          highlights: [
              { id: 'h1', text: '新文藝復興', color: 'red' },
              { id: 'h2', text: '寄明信片', color: 'green' }
          ]
      }
  },
  { 
      id: 'd3-2', date: '2026-02-17', time: '10:30', 
      title: '國家博物館', enTitle: 'National Museum', location: '瓦茨拉夫廣場 (Wenceslas Square)', category: '入場卷', categoryColor: 'red',
      guideInfo: {
          story: "捷克國家認同的象徵。2011-2018年間進行了大規模翻修，內部展覽現代且宏偉。",
          tip: "從博物館頂樓的圓頂可以俯瞰整個瓦茨拉夫廣場。主館與新館（原國會大廈）有地下通道相連。",
          highlights: [
              { id: 'h1', text: '圓頂景觀', color: 'blue' }
          ]
      }
  },

  // --- 2/18 (Wed) Day 4: Cesky Krumlov ---
  { 
      id: 'd4-1', date: '2026-02-18', time: '10:00', 
      title: '庫倫洛夫城堡', enTitle: 'Český Krumlov Castle', location: '彩繪塔周邊 (Zámek Český Krumlov)', category: '下車參觀', categoryColor: 'green',
      description: 'CK小鎮',
      guideInfo: {
          story: "規模僅次於布拉格城堡，輝煌的文藝復興與巴洛克面貌歸功於羅森堡家族 (Rosenberg)。",
          tip: "必去地標「彩繪塔」可俯瞰CK全景。宏偉的「斗篷橋」與護城河中飼養的「熊」也是亮點。",
          highlights: [
              { id: 'h1', text: '彩繪塔', color: 'red' },
              { id: 'h2', text: '斗篷橋', color: 'gray' },
              { id: 'h3', text: '護城河熊', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd4-2', date: '2026-02-18', time: '13:00', 
      title: '布拉格舊城區', enTitle: 'Old Town (Vnitřní Město)', location: '庫倫洛夫舊城 (Vnitřní Město)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "1992年列為世界文化遺產，被譽為「中世紀的完美縮影」。",
          tip: "舊城區內幾乎禁止車輛通行，步行是最佳方式。除了城堡，拉特蘭街 (Latrán) 也有許多絕佳拍照點。",
          highlights: [
              { id: 'h1', text: '世界遺產', color: 'blue' },
              { id: 'h2', text: '步行天堂', color: 'green' }
          ]
      }
  },

  // --- 2/19 (Thu) Day 5: Salzburg ---
  { 
      id: 'd5-1', date: '2026-02-19', time: '09:00', 
      title: '莫札特故居', enTitle: 'Mozart Residence', location: '格特萊德街 (Getreidegasse)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "莫札特一家在1773年時搬入的住所 (Wohnhaus)，而非出生地。",
          tip: "「出生地」在舊城區（黃色建築），而此處位於新城區馬卡特廣場，展品側重於家族生活和樂器。",
          highlights: [
              { id: 'h1', text: '故居 Wohnhaus', color: 'red' },
              { id: 'h2', text: '家族生活', color: 'green' }
          ]
      }
  },
  { 
      id: 'd5-2', date: '2026-02-19', time: '10:30', 
      title: '米拉貝爾花園', enTitle: 'Mirabell Palace & Gardens', location: '薩爾斯堡新城 (Schloss Mirabell)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "精美的巴洛克式花園，電影《真善美》瑪麗亞和孩子們歡唱〈Do-Re-Mi〉的場景。",
          tip: "花園免費開放。從這裡可以完美地「框」住遠處山丘上的莎姿堡城堡，是經典拍照角度。",
          highlights: [
              { id: 'h1', text: '真善美', color: 'purple' },
              { id: 'h2', text: 'Do-Re-Mi階梯', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd5-3', date: '2026-02-19', time: '13:00', 
      title: '莎姿堡城堡', enTitle: 'Hohensalzburg Fortress', location: '僧侶山 (Mönchsberg)', category: '入場卷', categoryColor: 'red',
      description: '(含上下纜車)',
      guideInfo: {
          story: "歐洲現存規模最大的中世紀城堡之一，矗立在舊城區上方。",
          tip: "搭乘城堡纜車僅需1分鐘。觀景台是俯瞰薩爾斯堡的最佳地點。內部有木偶博物館與酷刑室。",
          highlights: [
              { id: 'h1', text: '城堡纜車', color: 'red' },
              { id: 'h2', text: '全景觀景台', color: 'blue' },
              { id: 'h3', text: '黃金廳', color: 'orange' }
          ]
      }
  },

  // --- 2/20 (Fri) Day 6: Austria -> Germany -> Austria ---
  { 
      id: 'd6-1', date: '2026-02-20', time: '09:30', 
      title: '國王湖遊船', enTitle: 'Lake Königssee Boat Tour', location: '德國貝希特斯加登 (Berchtesgaden)', category: '入場卷', categoryColor: 'red',
      description: 'Königssee',
      guideInfo: {
          story: "德國最深、最乾淨的湖泊，冰川侵蝕形成的峽灣型湖泊。",
          tip: "船行中船長會吹奏小號演示「回音」。必看紅頂的「聖巴多羅買教堂」。建議步行至如仙境般的「上湖 (Obersee)」。",
          highlights: [
              { id: 'h1', text: '電動船', color: 'blue' },
              { id: 'h2', text: '回音', color: 'red' },
              { id: 'h3', text: '上湖', color: 'green' }
          ]
      }
  },
  { 
      id: 'd6-2', date: '2026-02-20', time: '13:00', 
      title: '鹽礦探秘之旅', enTitle: 'Salt Mine Tour', location: '哈萊因 (Hallein) /貝希特斯加登', category: '入場卷', categoryColor: 'red',
      guideInfo: {
          story: "「鹽」是中世紀的白金。此區財富均來自鹽礦。",
          tip: "需換上傳統礦工服。體驗亮點是兩段刺激的木製溜滑梯，以及搭乘木筏渡過地底鹽水湖。",
          highlights: [
              { id: 'h1', text: '木製溜滑梯', color: 'orange' },
              { id: 'h2', text: '礦工服', color: 'gray' },
              { id: 'h3', text: '地底鹽湖', color: 'blue' }
          ]
      }
  },

  // --- 2/21 (Sat) Day 7: Germany/Austria Border ---
  { 
      id: 'd7-1', date: '2026-02-21', time: '09:00', 
      title: '哈斯達特小鎮', enTitle: 'Hallstatt Old Town', location: '哈修塔特湖區 (Hallstatt)', category: '下車參觀', categoryColor: 'green',
      description: 'Hallstatt',
      guideInfo: {
          story: "1997年列為世界文化遺產，被譽為世界上最美的小鎮之一，歷史與鹽礦密不可分。",
          tip: "經典明信片角度位於小鎮北側公路旁。因墓地空間有限，教堂旁有獨特的「人骨室」。",
          highlights: [
              { id: 'h1', text: '世界遺產', color: 'blue' },
              { id: 'h2', text: '人骨室', color: 'gray' }
          ]
      }
  },
  { 
      id: 'd7-2', date: '2026-02-21', time: '13:00', 
      title: '百水公寓', enTitle: 'Hundertwasser House', location: '維也納第3區 (Landstraße)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "由藝術家「百水先生」設計，於1985年完工的公共住宅，是維也納建築的異類。",
          tip: "內部有居民無法參觀。建議去對面的「百水藝術村」商場體驗其風格，或步行至附近的百水藝術館。",
          highlights: [
              { id: 'h1', text: '奇特建築', color: 'orange' },
              { id: 'h2', text: '百水藝術村', color: 'green' }
          ]
      }
  },
  { 
      id: 'd7-3', date: '2026-02-21', time: '15:00', 
      title: '卡爾教堂', enTitle: 'Karlskirche', location: '卡爾廣場 (Karlsplatz)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "巴洛克建築巔峰，1713年皇帝卡爾六世為感謝黑死病結束而建。",
          tip: "前方水池可拍出完美倒影。教堂內部有全景電梯可直達穹頂近距離欣賞濕壁畫（需購票）。",
          highlights: [
              { id: 'h1', text: '巴洛克', color: 'orange' },
              { id: 'h2', text: '穹頂電梯', color: 'blue' }
          ]
      }
  },

  // --- 2/22 (Sun) Day 8: Hallstatt/Vienna ---
  { 
      id: 'd8-1', date: '2026-02-22', time: '09:00', 
      title: '瑪麗亞特蕾莎廣場', enTitle: 'Maria-Theresien-Platz', location: '博物館區 (Museumsquartier)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "紀念哈布斯堡王朝國母 瑪麗亞·特蕾莎女皇 (歐洲丈母娘) 的廣場。",
          tip: "兩側矗立著「雙胞胎」建築：藝術史博物館與自然史博物館。後方即是現代化的維也納博物館區 (MQ)。",
          highlights: [
              { id: 'h1', text: '藝術史博物館', color: 'red' },
              { id: 'h2', text: '自然史博物館', color: 'green' }
          ]
      }
  },
  { 
      id: 'd8-2', date: '2026-02-22', time: '10:00', 
      title: '霍夫堡宮', enTitle: 'The Hofburg', location: '維也納第1區 (Innere Stadt)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "哈布斯堡王朝的冬宮。西西 (Sisi) 是伊莉莎白皇后的真實暱稱，茜茜則是電影譯名。",
          tip: "參觀重點包含西西博物館、皇家公寓與銀器收藏館。西班牙馬術學校也位於此區。",
          highlights: [
              { id: 'h0', text: '冬宮', color: 'blue' },
              { id: 'h1', text: '西西博物館', color: 'purple' },
              { id: 'h2', text: '皇家公寓', color: 'red' },
              { id: 'h3', text: '銀器館', color: 'gray' }
          ]
      }
  },
  { 
      id: 'd8-3', date: '2026-02-22', time: '11:00', 
      title: '黑死病紀念柱', enTitle: 'Plague Column (Pestsäule)', location: '格拉本大街 (Graben)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "紀念1679年奪走維也納三分之一人口的瘟疫。",
          tip: "位於步行街中央的露天雕塑。頂端是聖三一，底座象徵瘟疫女巫，中間是皇帝利奧波德一世。\n\n可至附近的德梅爾咖啡店（Café Demel）購買維也納知名甜點「糖漬紫羅蘭 Candied Violets」。",
          highlights: [
              { id: 'h1', text: '聖三一', color: 'orange' },
              { id: 'h2', text: '巴洛克雕塑', color: 'gray' },
              { id: 'h3', text: '糖漬紫羅蘭', color: 'purple' }
          ],
          relatedLink: {
              text: "Café Demel",
              url: "https://maps.app.goo.gl/jj2MoyzjczhqNUCJ8"
          }
      }
  },
  { 
      id: 'd8-4', date: '2026-02-22', time: '14:00', 
      title: '熊布朗宮 (美泉宮)', enTitle: 'Schönbrunn Palace', location: '維也納第13區 (Hietzing)', category: '入場卷', categoryColor: 'red',
      description: 'Schönbrunn Palace',
      guideInfo: {
          story: "1996年列為世界文化遺產。此處原為皇家狩獵小屋，後經瑪麗亞·特蕾莎女皇（歐洲丈母娘）改建為巴洛克式宮殿。\n\n這裡曾是6歲神童莫札特演奏之地，也是末代皇帝卡爾一世簽署放棄權力文件、終結帝國統治的歷史現場。",
          tip: "購票：參觀宮殿內部必須購票（如 Imperial Tour 或 Grand Tour），強烈建議「提早上網預訂」。\n花園：宮殿後方的法式花園是免費開放的。\n凱旋門：務必爬上花園對面的山丘，抵達「凱旋門」，那是俯瞰全景的「最佳地點」。\n動物園：世界上現存最古老的動物園也位於此。",
          highlights: [
              { id: 'h0', text: '夏宮', color: 'blue' },
              { id: 'h3', text: '世界文化遺產', color: 'red' },
              { id: 'h1', text: '凱旋門觀景', color: 'orange' },
              { id: 'h2', text: '神童莫札特', color: 'purple' },
              { id: 'h4', text: '最古老動物園', color: 'green' }
          ]
      }
  },

  // --- 2/23 (Mon) Day 9: Vienna ---
  { 
      id: 'd9-1', date: '2026-02-23', time: '09:00', 
      title: '百水公寓', enTitle: 'Hundertwasser House', location: '維也納第3區 (Landstraße)', category: '下車參觀', categoryColor: 'green',
      guideInfo: {
          story: "再次造訪這座充滿生命力的綠建築，感受其與自然共生的理念。",
          tip: "若上次未參觀百水藝術館，今日可安排前往，欣賞更多百水先生的畫作與建築模型。",
          highlights: [
              { id: 'h1', text: '自然共生', color: 'green' },
              { id: 'h2', text: '藝術巡禮', color: 'orange' }
          ]
      }
  },
  { 
      id: 'd9-2', date: '2026-02-23', time: '10:00', 
      title: '聖史帝芬教堂', enTitle: "St. Stephen's Cathedral", location: '史蒂芬廣場 (Stephansplatz)', category: '入場卷', categoryColor: 'red',
      description: '(南塔、北塔二擇一登頂)',
      guideInfo: {
          story: "維也納的靈魂象徵，始建於12世紀。",
          tip: "南塔需爬343階樓梯但景色最佳；北塔有電梯可看普默林大鐘。亦可參加導覽參觀存放著哈布斯堡王朝早期成員內臟的地下墓穴。\n\n＊可至附近的德梅爾咖啡店（Café Demel）購買維也納知名甜點「糖漬紫羅蘭Candied Violets」。",
          highlights: [
              { id: 'h1', text: '南塔(樓梯)', color: 'red' },
              { id: 'h2', text: '北塔(電梯)', color: 'blue' },
              { id: 'h3', text: '地下墓穴', color: 'gray' },
              { id: 'h4', text: '糖漬紫羅蘭', color: 'purple' }
          ],
          relatedLink: {
              text: "Café Demel",
              url: "https://maps.app.goo.gl/9d1vrMbcqkoDpHqb6"
          }
      }
  },
  { 
      id: 'd9-3', date: '2026-02-23', time: '14:00', 
      title: '潘朵夫購物村', enTitle: 'Designer Outlet Parndorf', location: '潘朵夫 (Parndorf)', category: '入場卷', categoryColor: 'red',
      description: 'Parndorf Outlet',
      guideInfo: {
          story: "中歐最大的設計師暢貨中心之一，擁有充滿布爾根蘭州傳統風格的建築設計。",
          tip: "建議先至遊客中心領取地圖與額外折扣券。退稅手續可在現場辦理（需信用卡擔保），或是留到機場處理。",
          highlights: [
              { id: 'h1', text: '購物天堂', color: 'red' },
              { id: 'h2', text: '退稅服務', color: 'blue' }
          ]
      }
  },
  { 
      id: 'd9-4', date: '2026-02-23', time: '21:45', displayTime: '21:45',
      title: '起飛', enTitle: 'Departure', location: 'VIE 維也納國際機場', category: 'transport', categoryColor: 'red',
      description: '往 DXB 杜拜機場'
  },

  // --- 2/24 (Tue) Day 10/11: DXB -> TPE ---
  { 
      id: 'd10-1', date: '2026-02-24', time: '06:25', displayTime: '06:25',
      title: '降落', enTitle: 'Arrival', location: 'DXB 杜拜機場', category: 'transport', categoryColor: 'red'
  },
  { 
      id: 'd10-2', date: '2026-02-24', time: '08:45', displayTime: '08:45',
      title: '起飛 (轉機)', enTitle: 'Transfer Departure', location: 'DXB 杜拜機場', category: 'transport', categoryColor: 'red',
      description: '往 TPE 桃園機場'
  },
  { 
      id: 'd10-3', date: '2026-02-24', time: '20:40', displayTime: '20:40',
      title: '降落', enTitle: 'Arrival', location: 'TPE 桃園機場', category: 'transport', categoryColor: 'red',
      description: '抵達溫暖的家'
  },
];

const MOCK_BOOKINGS: Booking[] = [
    // --- Outbound Flight 1 ---
    {
        id: 'flight-1',
        type: 'flight',
        title: 'TPE - DXB',
        subTitle: 'Emirates (阿聯酋航空)',
        referenceNo: 'EK387',
        date: '2026-02-15',
        time: '00:20', 
        details: {
            '出發': '00:20 (TPE)',
            '抵達': '06:15 (DXB)',
            '飛行時間': '9h 55m'
        },
        status: 'confirmed'
    },
    // --- Outbound Flight 2 (Transfer) ---
    {
        id: 'flight-2',
        type: 'flight',
        title: 'DXB - PRG',
        subTitle: 'Emirates (阿聯酋航空) - 轉機',
        referenceNo: 'EK139',
        date: '2026-02-15',
        time: '08:40', 
        details: {
            '出發': '08:40 (DXB)',
            '抵達': '12:30 (PRG)',
            '飛行時間': '6h 50m',
            '備註': '轉機航班'
        },
        status: 'confirmed'
    },
    // --- Inbound Flight 1 ---
    {
        id: 'flight-3',
        type: 'flight',
        title: 'VIE - DXB',
        subTitle: 'Emirates (阿聯酋航空)',
        referenceNo: 'EK126',
        date: '2026-02-23',
        time: '21:45', 
        details: {
            '出發': '21:45 (VIE)',
            '抵達': '06:25 +1 (DXB)',
            '飛行時間': '5h 25m'
        },
        status: 'confirmed'
    },
    // --- Inbound Flight 2 (Transfer) ---
    {
        id: 'flight-4',
        type: 'flight',
        title: 'DXB - TPE',
        subTitle: 'Emirates (阿聯酋航空) - 轉機',
        referenceNo: 'EK386',
        date: '2026-02-24',
        time: '08:45', 
        details: {
            '出發': '08:45 (DXB)',
            '抵達': '20:40 (TPE)',
            '飛行時間': '7h 55m',
            '備註': '轉機航班'
        },
        status: 'confirmed'
    }
];

// --- SHARED UTILS ---
const TAG_COLORS: Record<HighlightColor, string> = {
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
};

const NODE_TEXT_COLORS: Record<HighlightColor, string> = {
    red: 'text-red-500',
    orange: 'text-orange-500',
    green: 'text-green-600',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500'
};

const LUNAR_DATES: Record<string, string> = {
    '2026-02-15': '小年夜',
    '2026-02-16': '除夕',
    '2026-02-17': '初一',
    '2026-02-18': '初二',
    '2026-02-19': '初三',
    '2026-02-20': '初四',
    '2026-02-21': '初五',
    '2026-02-22': '初六'
};

// Map WMO weather code to our simple types
const mapWmoToCondition = (code: number): WeatherInfo['condition'] => {
    if (code === 0) return 'sunny';
    if (code <= 3) return 'cloudy';
    if (code <= 48) return 'cloudy';
    if (code <= 67) return 'rain';
    if (code <= 77) return 'snow';
    if (code <= 82) return 'rain';
    if (code <= 86) return 'snow';
    return 'rain';
};

// Helper to get icon for category/activity
const getCategoryIcon = (item: ScheduleItem): string => {
    if (item.category === 'transport') {
        if (item.title.includes('起飛') || item.title.includes('降落')) return 'fa-plane-up';
        return 'fa-train-subway';
    }
    if (item.title.includes('廣場') || item.title.includes('小鎮')) return 'fa-archway';
    if (item.title.includes('城堡') || item.title.includes('宮')) return 'fa-chess-rook';
    if (item.title.includes('教堂')) return 'fa-church';
    if (item.title.includes('博物館') || item.title.includes('故居')) return 'fa-building-columns';
    if (item.title.includes('花園') || item.title.includes('湖')) return 'fa-tree';
    if (item.title.includes('購物')) return 'fa-bag-shopping';
    if (item.category === '下車參觀') return 'fa-camera-retro';
    return 'fa-location-dot';
};

// Helper Component for Rendering a single Schedule Row
const ScheduleItemRow: React.FC<{ item: ScheduleItem }> = ({ item }) => {
    const isTransport = item.category === 'transport';
    const timeStr = item.displayTime || item.time;
    const [mainTime, subTime] = timeStr.includes('\n') ? timeStr.split('\n') : [timeStr, null];
    const [hour, minute] = mainTime.split(':');
    
    // Get contextual icon
    const iconClass = getCategoryIcon(item);

    return (
        <div className="relative mb-2 flex gap-0 group">
            {/* 1. Time Column - Optimised for space & layout */}
            {/* COMPACTED: w-12, pr-3 (Increased padding to push text left further) */}
            <div className="w-12 py-4 flex flex-col items-end justify-start flex-shrink-0 pr-3">
                {isTransport ? (
                    <>
                        <div className="flex items-baseline justify-end gap-[1px] leading-none text-zen-text">
                            <span className="text-xl font-mono font-bold tracking-tighter text-stone-700">{hour}</span>
                            <span className="text-sm font-mono font-bold text-stone-400">:{minute}</span>
                        </div>
                        {subTime && (
                            <span className="text-[9px] text-gray-300 font-mono mt-1 text-right leading-tight">{subTime}</span>
                        )}
                    </>
                ) : (
                    <div className="h-full w-full"></div>
                )}
            </div>

            {/* 2. Timeline Line & Node */}
            {/* COMPACTED: w-8 -> w-6 */}
            <div className="relative flex flex-col items-center px-0 flex-shrink-0 w-6">
                {/* Dashed Line for a "Journey" feel */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] border-l-2 border-dashed border-stone-300/60"></div>
                
                {/* Icon Node */}
                <div 
                    className={`
                        relative z-10 flex items-center justify-center transition-all duration-300 mt-[1.4rem]
                        bg-zen-bg rounded-full border-2 
                        ${isTransport 
                            ? `w-8 h-8 ${NODE_TEXT_COLORS[item.categoryColor || 'gray']} border-current shadow-sm` 
                            : `w-7 h-7 text-stone-400 border-stone-300 bg-white`
                        }
                    `}
                >
                    <i className={`fa-solid ${iconClass} text-[10px]`}></i>
                </div>
            </div>

            {/* 3. Content Card Column */}
            {/* ADJUSTED: pl-2 -> pl-3 to give a tiny bit of separation after compacting left side */}
            <div className="flex-grow min-w-0 py-2 pb-6 pl-3">
                <div 
                    className={`
                        bg-white rounded-2xl p-4 shadow-zen border border-stone-50 
                        transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-zen-hover
                        relative overflow-hidden
                    `}
                >
                    {/* Decorative Watermark Icon (Absolute Positioned) */}
                    <div className="absolute -bottom-4 -right-4 text-8xl text-stone-800 opacity-[0.03] transform -rotate-12 pointer-events-none select-none z-0">
                        <i className={`fa-solid ${iconClass}`}></i>
                    </div>

                    {/* Content Container (z-10 to sit above watermark) */}
                    <div className="relative z-10">
                        {/* Header: Title & Category Badge */}
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="flex flex-col">
                                <h3 className="font-bold text-lg leading-tight text-zen-text">{item.title}</h3>
                                {item.enTitle && (
                                    <span className="text-[10px] font-mono text-gray-400 font-medium tracking-wide mt-0.5">{item.enTitle}</span>
                                )}
                            </div>
                            <div className="flex-shrink-0 mt-0.5 opacity-80 scale-90 origin-top-right">
                                <CategoryBadge type={item.category} color={item.categoryColor} />
                            </div>
                        </div>

                        {/* Location with Icon */}
                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-2 mt-1">
                            <i className="fa-solid fa-location-dot text-[10px] text-zen-primary"></i> 
                            <span className="truncate font-medium">{item.location}</span>
                        </div>

                        {/* Description */}
                        {item.description && (
                            <div className="text-xs text-gray-400 font-medium whitespace-pre-line leading-relaxed mb-2 pl-4 border-l-2 border-stone-100">
                                {item.description}
                            </div>
                        )}
                        
                        {/* Business Hours */}
                        {item.businessHours && (
                            <div className="text-[10px] font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded inline-block mb-1">
                                <i className="fa-regular fa-clock mr-1"></i>營業時間: {item.businessHours}
                            </div>
                        )}

                        {/* Details Section */}
                        {(item.guideInfo?.story || item.guideInfo?.tip || (item.guideInfo?.highlights && item.guideInfo.highlights.length > 0)) && (
                            <div className="mt-4 pt-3 border-t border-dashed border-gray-100">
                                {item.guideInfo?.story && (
                                    <p className="text-sm text-gray-600 leading-relaxed font-sans mb-3 whitespace-pre-line text-left">
                                        {item.guideInfo.story}
                                    </p>
                                )}
                                
                                {item.guideInfo?.tip && (
                                    <div className="bg-orange-50/50 border border-orange-100 p-3 mb-3 rounded-lg relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-300"></div>
                                        <div className="flex gap-2 relative z-10">
                                            <i className="fa-solid fa-lightbulb text-orange-400 mt-0.5 text-xs"></i>
                                            <p className="text-xs text-orange-800 font-medium leading-relaxed whitespace-pre-line">{item.guideInfo.tip}</p>
                                        </div>
                                    </div>
                                )}

                                {item.guideInfo?.highlights && item.guideInfo.highlights.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {item.guideInfo.highlights.map(h => (
                                            <span key={h.id} className={`text-[10px] px-2.5 py-1 rounded-full border font-bold shadow-sm ${TAG_COLORS[h.color]}`}>{h.text}</span>
                                        ))}
                                    </div>
                                )}

                                {item.guideInfo?.relatedLink && (
                                    <div className="flex justify-end mt-3">
                                        <a 
                                            href={item.guideInfo.relatedLink.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="
                                                inline-flex items-center gap-2 
                                                pl-1 pr-3 py-1 
                                                mt-2
                                                bg-white hover:bg-stone-50 
                                                active:scale-95 active:bg-stone-100 active:border-stone-300
                                                border border-stone-200 rounded-full 
                                                transition-all duration-200
                                                shadow-sm
                                                group/link
                                            "
                                        >
                                            <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover/link:text-stone-500 group-hover/link:bg-stone-200 transition-colors">
                                                 <i className="fa-solid fa-location-dot text-[10px]"></i>
                                            </div>
                                            <span className="text-xs font-bold text-stone-500 group-hover/link:text-stone-600">
                                                {item.guideInfo.relatedLink.text}
                                            </span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SCHEDULE TAB ---

// Dimensions Constants for Date Picker (Ensure precise pixel alignment)
const DATE_ITEM_WIDTH = 52;
const DATE_ITEM_GAP = 8;
const DATE_CONTAINER_PADDING = 16;

export const ScheduleTab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2026-02-15');
  const [items, setItems] = useState(MOCK_SCHEDULE);
  const [weather, setWeather] = useState<WeatherInfo>({ condition: 'cloudy', temp: 5, locationName: '布拉格' });
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // Swipe State
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);

  // Scroll Container Refs
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dateScrollRef = useRef<HTMLDivElement>(null);

  // Memoize dates
  const dates = useMemo(() => Array.from(new Set(items.map(i => i.date))).sort() as string[], [items]);
  const currentIndex = dates.indexOf(selectedDate);

  // Reset scroll on date change logic if needed, but since we use a slider, 
  // we might want to ensure the target slide is at top or preserve.
  // The user likely expects it to be at the top when switching days.
  useLayoutEffect(() => {
    if (currentIndex >= 0 && scrollRefs.current[currentIndex]) {
        const el = scrollRefs.current[currentIndex];
        if (el) {
             // Reset scroll position to top when switching to this date
             el.scrollTo(0, 0);
        }
    }
  }, [currentIndex]);

  // Auto-scroll date selector to keep selected date in view
  useEffect(() => {
    if (dateScrollRef.current) {
        const index = dates.indexOf(selectedDate);
        if (index >= 0) {
            const container = dateScrollRef.current;
            // Calculations using same constants as CSS
            const itemCenter = DATE_CONTAINER_PADDING + index * (DATE_ITEM_WIDTH + DATE_ITEM_GAP) + DATE_ITEM_WIDTH / 2;
            const containerCenter = container.clientWidth / 2;
            const scrollLeft = itemCenter - containerCenter;
            
            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }
  }, [selectedDate, dates]);

  // Determine Location Name based on date range
  const getLocationInfo = (date: string) => {
      if (date >= '2026-02-15' && date <= '2026-02-19') return '捷克 Czech Republic';
      if (date === '2026-02-20') return '德國 Germany';
      if (date >= '2026-02-21' && date <= '2026-02-24') return '奧地利 Austria';
      return '歐洲 Europe';
  };

  const locationHeader = getLocationInfo(selectedDate);
  const lunarText = LUNAR_DATES[selectedDate];

  // Real Weather Fetching
  useEffect(() => {
    const fetchWeather = async () => {
        setLoadingWeather(true);
        let url = '';
        let locationName = '';

        if (selectedDate >= '2026-02-15' && selectedDate <= '2026-02-19') {
            url = 'https://api.open-meteo.com/v1/forecast?latitude=50.08&longitude=14.43&current_weather=true&timezone=auto';
            locationName = '布拉格';
        } else if (selectedDate === '2026-02-20') {
            url = 'https://api.open-meteo.com/v1/forecast?latitude=47.59&longitude=12.99&current_weather=true&timezone=auto';
            locationName = '貝希特斯加登';
        } else if (selectedDate >= '2026-02-21' && selectedDate <= '2026-02-24') {
            url = 'https://api.open-meteo.com/v1/forecast?latitude=48.21&longitude=16.37&current_weather=true&timezone=auto';
            locationName = '維也納';
        } else {
             url = 'https://api.open-meteo.com/v1/forecast?latitude=50.08&longitude=14.43&current_weather=true&timezone=auto';
             locationName = '歐洲';
        }

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.current_weather) {
                setWeather({
                    temp: Math.round(data.current_weather.temperature),
                    condition: mapWmoToCondition(data.current_weather.weathercode),
                    locationName: locationName
                });
            }
        } catch (error) {
            console.error("Failed to fetch weather", error);
        } finally {
            setLoadingWeather(false);
        }
    };

    fetchWeather();
  }, [selectedDate]);
  
  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    // Ensure it's a horizontal swipe and long enough
    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > 50) {
       if (distanceX > 0 && currentIndex < dates.length - 1) {
           // Swipe Left -> Next
           setSelectedDate(dates[currentIndex + 1]);
       } else if (distanceX < 0 && currentIndex > 0) {
           // Swipe Right -> Prev
           setSelectedDate(dates[currentIndex - 1]);
       }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* FIXED HEADER SECTION */}
      <div className="flex-shrink-0 bg-zen-bg z-20 px-4 pb-4 shadow-sm">
          {/* Date Navigation */}
          <div className="-mx-4 mb-2">
              <div 
                ref={dateScrollRef}
                /* 
                   CRITICAL FIX: 
                   Use arbitrary values [16px], [8px], [4px] to force pixels instead of rem.
                   This ensures exact alignment with JS calculation regardless of root font size.
                */
                className="flex gap-[8px] overflow-x-auto no-scrollbar px-[16px] py-[4px] snap-x items-center relative"
              >
                {/* Sliding Pill Background - Fixed Positioning Logic */}
                <div 
                    className={`absolute top-[4px] bottom-[4px] w-[52px] bg-[#464646] rounded-[16px] shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] z-0 ${currentIndex === -1 ? 'opacity-0' : 'opacity-100'}`}
                    style={{
                        // Calculation: Padding (16) + index * (ItemWidth (52) + Gap (8))
                        left: `${DATE_CONTAINER_PADDING + (currentIndex === -1 ? 0 : currentIndex) * (DATE_ITEM_WIDTH + DATE_ITEM_GAP)}px`
                    }}
                />

                {dates.map((date) => {
                    const d = new Date(date);
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dayNum = d.getDate();
                    const isSelected = date === selectedDate;
                    return (
                        <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className="snap-center flex-shrink-0 flex flex-col items-center justify-center w-[52px] h-[72px] rounded-[16px] transition-all duration-300 relative z-10 group"
                        >
                            {/* White Background Card (fades out when selected) */}
                            <div 
                                className={`absolute inset-0 bg-white rounded-[16px] shadow-sm transition-all duration-300 -z-10 group-hover:bg-gray-50 ${isSelected ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                            ></div>

                            <span className={`text-[9px] font-black tracking-widest mb-1 font-sans z-10 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400'}`}>{dayName}</span>
                            <span className={`text-[20px] font-bold font-sans leading-none z-10 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-400'}`}>{dayNum}</span>
                        </button>
                    )
                })}
              </div>
          </div>

          {/* Date Header Info & Weather */}
          <div className="flex justify-between items-end px-2 relative">
             <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Day Plan</div>
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-mono font-bold text-zen-text leading-none">{selectedDate}</h2>
                    {lunarText && (
                        <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm tracking-widest flex items-center gap-1">
                            <i className="fa-solid fa-star text-[8px]"></i>
                            <span>{lunarText}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                    <i className="fa-solid fa-location-dot text-zen-primary"></i> 
                    <span>{locationHeader}</span>
                </div>
             </div>
             {/* Weather Widget (Glassmorphism) */}
             <div className="bg-white/30 backdrop-blur-xl border border-white/40 p-3 rounded-2xl shadow-lg flex flex-col items-center justify-center min-w-[80px] h-[82px] box-border z-10 relative">
                {loadingWeather ? (
                     <i className="fa-solid fa-spinner fa-spin text-gray-300 text-2xl"></i>
                ) : (
                    <>
                        <div className="text-2xl mb-1 h-8 flex items-center justify-center filter drop-shadow-sm">
                            {weather.condition === 'sunny' && <i className="fa-solid fa-sun text-orange-400 animate-spin-slow"></i>}
                            {weather.condition === 'cloudy' && <i className="fa-solid fa-cloud text-gray-400"></i>}
                            {weather.condition === 'rain' && <i className="fa-solid fa-cloud-rain text-blue-400"></i>}
                            {weather.condition === 'snow' && <i className="fa-regular fa-snowflake text-blue-200"></i>}
                        </div>
                        <div className="text-sm font-bold font-mono h-5 flex items-center text-gray-700">{weather.temp}°C</div>
                    </>
                )}
             </div>
          </div>
      </div>

      {/* 
        SLIDER TIMELINE SECTION 
        Uses a full-width container with flex layout and translateX to slide between days.
      */}
      <div 
        className="flex-1 overflow-hidden relative w-full touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
         <div 
            className="flex h-full transition-transform duration-300 ease-out will-change-transform"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
         >
            {dates.map((date, idx) => {
                const dayItems = items.filter(i => i.date === date);
                return (
                    <div 
                        key={date}
                        // Assign ref to array for scrolling control
                        ref={el => { scrollRefs.current[idx] = el; }}
                        className="w-full h-full flex-shrink-0 overflow-y-auto no-scrollbar px-4 pb-24"
                    >
                        <div className="relative pt-4">
                             {dayItems.map((item) => (
                                <ScheduleItemRow key={item.id} item={item} />
                             ))}
                             
                             {dayItems.length === 0 && (
                                <div className="text-center py-10 text-gray-400 opacity-60">
                                    <i className="fa-regular fa-calendar-plus text-4xl mb-2"></i>
                                    <p className="text-sm">No plans for this day yet.</p>
                                </div>
                             )}
                        </div>
                    </div>
                );
            })}
         </div>
      </div>
    </div>
  );
};

// --- BOOKINGS TAB ---

const BARCODE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAxMDAgMzAiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSIwIi8+PHJlY3Qgd2lkdGg9IjIiIGhlaWdodD0iMzAiIHg9IjQiLz48cmVjdCB3aWR0aD0iMyIgaGVpZ2h0PSIzMCIgeD0iOCIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMwIiB4PSIxMyIvPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMwIiB4PSIxNiIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSIyMiIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMwIiB4PSIyNiIvPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMwIiB4PSIyOSIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSIzNCIvPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMwIiB4PSIzOCIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSI0NCIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMwIiB4PSI0OCIvPjxyZWN0IHdpZHRoPSI1IiBoZWlnaHQ9IjMwIiB4PSI1MiIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSI1OSIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSI2NCIvPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMwIiB4PSI2OCIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSI3MyIvPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMwIiB4PSI3NyIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSI4MyIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjMwIiB4PSI4NyIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSI5MCIvPjxyZWN0IHdpZHRoPSIzIiBoZWlnaHQ9IjMwIiB4PSI5NCIvPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjMwIiB4PSI5OCIvPjwvc3ZnPg==";

// Mapping City Codes to Names for clearer display
const CITY_NAMES: Record<string, string> = {
    'TPE': 'Taipei',
    'DXB': 'Dubai',
    'PRG': 'Prague',
    'VIE': 'Vienna'
};

export const BookingsTab: React.FC = () => {
    const [bookings] = useState<Booking[]>(MOCK_BOOKINGS);

    return (
        <div className="h-full overflow-y-auto px-5 pb-24 space-y-6 no-scrollbar">
            {/* Removed sticky header for better flow */}
            <h2 className="text-lg font-bold text-zen-text/50 uppercase tracking-widest mt-5 mb-2">
                Boarding Passes
            </h2>
            
            <div className="space-y-6">
                {bookings.map((booking, index) => {
                    const isTransfer = booking.details['備註'] === '轉機航班';
                    // Determine accent color based on flight type/direction
                    const accentColor = isTransfer ? 'bg-orange-400' : (index % 2 === 0 ? 'bg-zen-primary' : 'bg-zen-secondary');
                    const accentText = isTransfer ? 'text-orange-400' : (index % 2 === 0 ? 'text-zen-primary' : 'text-zen-secondary');
                    
                    const originCode = booking.title.split(' - ')[0];
                    const destCode = booking.title.split(' - ')[1];

                    return (
                        <div key={booking.id} className="bg-white rounded-2xl shadow-zen relative overflow-hidden flex flex-col transition-transform active:scale-[0.99] group">
                            
                            {/* 1. Color Strip Top */}
                            <div className={`h-1.5 w-full ${accentColor}`}></div>

                            {/* 2. Header: Airline & Status */}
                            <div className="px-5 py-3 flex justify-between items-center border-b border-stone-100">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full ${accentColor} bg-opacity-10 flex items-center justify-center`}>
                                        <i className={`fa-solid fa-plane text-xs ${accentText}`}></i>
                                    </div>
                                    <span className="text-xs font-bold text-zen-text tracking-wide">{booking.subTitle.split(' - ')[0]}</span>
                                </div>
                                {isTransfer && (
                                    <span className="bg-orange-50 text-orange-500 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Layover</span>
                                )}
                            </div>

                            {/* 3. Main Flight Body */}
                            <div className="p-5 pb-2">
                                <div className="flex justify-between items-center">
                                    {/* Departure */}
                                    <div className="flex flex-col">
                                        <div className="text-xs font-bold text-zen-primary mb-1 uppercase tracking-wider">{CITY_NAMES[originCode] || originCode}</div>
                                        <div className="text-4xl font-mono font-bold text-zen-text leading-none tracking-tighter">
                                            {booking.time}
                                        </div>
                                        <div className="text-xs font-bold text-stone-300 mt-1">{booking.date}</div>
                                        {/* Code moved to background/secondary position */}
                                        <div className="text-lg font-bold text-stone-200 mt-1">{originCode}</div>
                                    </div>

                                    {/* Center Graphic */}
                                    <div className="flex flex-col items-center justify-center -mt-4">
                                        <div className={`px-3 py-1 rounded-full ${isTransfer ? 'bg-orange-50 text-orange-400' : 'bg-stone-50 text-stone-400'} flex items-center gap-1.5 mb-1`}>
                                             <i className="fa-regular fa-clock text-[10px]"></i>
                                             <span className="text-[10px] font-mono font-bold">{booking.details['飛行時間']}</span>
                                        </div>
                                        <div className="w-16 h-[2px] bg-stone-100 relative">
                                            <div className={`absolute right-0 -top-1 w-2 h-2 rounded-full ${accentColor}`}></div>
                                            <div className={`absolute left-0 -top-1 w-2 h-2 rounded-full ${isTransfer ? 'bg-orange-200' : 'bg-stone-200'}`}></div>
                                        </div>
                                    </div>

                                    {/* Arrival */}
                                    <div className="flex flex-col text-right">
                                        <div className="text-xs font-bold text-zen-primary mb-1 uppercase tracking-wider">{CITY_NAMES[destCode] || destCode}</div>
                                        {/* Approximate arrival time logic for display only since we don't have it in main prop clearly separated sometimes */}
                                        <div className="text-4xl font-mono font-bold text-zen-text leading-none tracking-tighter">
                                            {booking.details['抵達']?.split(' ')[0] || '--:--'}
                                        </div>
                                         <div className="text-xs font-bold text-stone-300 mt-1">
                                            {booking.details['抵達']?.includes('+1') ? 'Next Day' : booking.date}
                                        </div>
                                        <div className="text-lg font-bold text-stone-200 mt-1">{destCode}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Details Grid (Simplified) */}
                            <div className="px-5 pb-6">
                                 <div className="flex justify-center">
                                     <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
                                         <i className={`fa-solid fa-plane-circle-check ${accentText}`}></i>
                                         <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Flight</span>
                                         <span className="text-sm font-mono font-bold text-zen-text ml-1">{booking.referenceNo}</span>
                                     </div>
                                 </div>
                            </div>

                            {/* Cutout */}
                            <div className="relative h-4 w-full flex items-center justify-center overflow-hidden">
                                 <div className="absolute left-0 -ml-2 w-4 h-4 bg-zen-bg rounded-full shadow-[inset_-1px_0_2px_rgba(0,0,0,0.05)]"></div>
                                 <div className="w-full mx-3 border-b-2 border-dashed border-stone-300"></div>
                                 <div className="absolute right-0 -mr-2 w-4 h-4 bg-zen-bg rounded-full shadow-[inset_1px_0_2px_rgba(0,0,0,0.05)]"></div>
                            </div>

                            {/* Footer Barcode */}
                            <div className="px-6 py-4 flex justify-between items-center opacity-70">
                                 <div className="flex flex-col">
                                     <span className="text-[9px] text-stone-400 font-mono tracking-widest uppercase">Passenger</span>
                                     <span className="text-xs font-bold text-stone-600">FAMILY MEMBER</span>
                                 </div>
                                 <img src={BARCODE_SVG} className="h-5 w-20 object-fill opacity-30 grayscale mix-blend-multiply" alt="barcode" />
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

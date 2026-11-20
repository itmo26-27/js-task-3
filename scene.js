// Печатная подложка неподвижна. Активные сегменты рисуются поверх неё.
function createWolfScene(canvas) {
  const ctx = canvas.getContext("2d");
  const width = 320, height = 208;
  const scale = canvas.width / width;
  ctx.scale(scale, scale);
  const ink = "#29302c", glass = "#b6b9a6";
  const timber = "#9b5846", timberEdge = "#784e43", foliage = "#566c4b";
  const lanes = {
    topLeft: [false, 0], bottomLeft: [false, 43],
    topRight: [true, 0], bottomRight: [true, 43]
  };
  function path(d, fill, stroke, lineWidth = 1) {
    const figure = new Path2D(d);
    if (fill) { ctx.fillStyle = fill; ctx.fill(figure); }
    if (stroke) {
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.strokeStyle = stroke; ctx.stroke(figure);
    }
  }
  function oval(x,y,rx,ry,color,rotation=0) {
    ctx.beginPath(); ctx.ellipse(x,y,rx,ry,rotation,0,2*Math.PI);
    ctx.fillStyle = color; ctx.fill();
  }
  function mirrored(right) {
    if (right) { ctx.translate(width,0); ctx.scale(-1,1); }
  }
  function hen() {
    path("M1 62 Q8 64 10 57 Q12 51 18 50 Q16 46 20 48 Q21 42 23 48 Q27 44 25 51 L30 54 L26 56 Q27 60 23 62 Q18 70 9 68 Q2 67 1 62Z", "#737868",ink,.7);
    path("M4 63 Q10 67 17 58 Q13 66 8 65 M15 68 l-1 3 m5 -4 l-1 4",null,ink,.9);
    oval(23,52,1,1,ink);
  }
  function ramp() {
    path("M1 71 L18 71 L76 95 L75 99 L18 76 L1 76Z",timber,timberEdge,.7);
    path("M7 76 v7 h-2 v-7 M26 79 v12 h-2 v-13 M55 91 v13 h-2 V90",timber,timberEdge,.6);
    path("M4 72 h13 l55 23",null,"#bea089",.7);
  }
  function grass(x,y,s) {
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    path("M0 0 q3 0 3 -4 l3 3 1 -6 3 5 4 -7 -1 7 5 -4 -2 5 6 -3 -2 4 7 -2 -3 4 H0Z",foliage);
    ctx.restore();
  }
  function scenery() {
    const ground = ctx.createLinearGradient(0,0,width,height);
    ground.addColorStop(0,"#adb19f"); ground.addColorStop(.62,"#c2c4b1"); ground.addColorStop(1,"#acb19e");
    ctx.fillStyle=ground; ctx.fillRect(0,0,width,height);
    // Домик зайца в левом углу, крона и трава нанесены краской на стекло.
    path("M0 38 L22 5 L51 58 L47 59 L21 14 L4 42Z",timber);
    path("M3 39 L21 17 L39 49 M4 44 v12 M31 40 v12 M32 18 v-8 h6 v20",null,timberEdge,2);
    path("M7 49 V34 q8 -10 16 0 v15z","#89907c",timberEdge,1);
    // Уши и мордочка зайца в окне.
    path("M9 47 q0 -5 3 -7 q-5 -13 -2 -14 q3 -1 5 12 q0 -14 3 -14 q3 1 0 14 q6 1 5 6 l4 1 q-3 6 -10 4 l-4 3z",ink);
    oval(19,41,.85,1.05,glass);
    path("M307 42 q1 -19 3 -26 m-2 13 l-9 -7 m10 2 l7 -8",null,"#70745f",2);
    for (const [x,y,r] of [[293,11,8],[302,8,9],[312,12,11],[320,8,11],[309,2,11]]) oval(x,y,r,r*.8,foliage);
    for (const [right,level] of Object.values(lanes)) {
      ctx.save(); mirrored(right); ctx.translate(0,level); hen(); ramp(); ctx.restore();
    }
    for (const [x,y,s] of [[3,163,1.2],[39,188,.72],[86,195,.9],[141,201,1.25],[229,195,.8],[286,185,1.15],[299,161,.85]]) grass(x,y,s);
    path("M3 194 q16 -2 33 0 m24 1 h18 m34 3 q14 1 23 -1 m47 1 q16 -2 24 -1 m56 -2 h19",null,foliage,.8);
  }
  function wolf(right,level) {
    ctx.save(); mirrored(right);
    // Профиль, приподнятая задняя нога и полосатые шорты бегущего волка.
    path("M138 157 Q150 162 160 150 Q161 162 150 167 Q157 169 161 165 Q153 177 138 169Z",ink);
    path("M124 164 Q115 167 116 173 Q119 178 135 184 L126 186 Q118 184 119 187 Q122 192 144 190 Q150 187 143 182 L127 172 L134 168Z",ink);
    path("M135 161 Q143 164 146 170 L159 161 Q160 154 156 151 Q153 149 153 155 L151 159 Q148 151 143 152 Q142 154 146 160 L145 163 L139 158Z",ink);
    path("M122 171 Q122 175 138 182 M124 188 Q136 189 142 187 M146 168 L155 160",null,glass,1.25);
    path("M117 146 Q127 143 144 151 L144 162 L137 167 L131 163 L122 169 Q115 162 117 146Z",ink);
    path("M119 151 L141 155 M120 156 l8 4 m7 -3 5 2",null,glass,1.3);
    path("M119 116 Q131 115 131 128 Q131 140 140 148 Q130 154 119 146 Q122 139 116 133 Q111 126 119 116Z",ink);
    path("M120 123 Q123 132 129 135 M122 143 l8 3",null,glass,1.2);
    // Чёлка, длинный нос, два уха, открытая пасть и клык.
    path("M116 107 Q116 97 120 91 Q116 83 121 73 Q123 70 124 76 L127 84 Q130 73 134 72 Q137 72 134 83 L132 88 L140 84 L136 91 L144 89 L140 96 L145 97 L138 102 L141 108 L134 107 L135 114 L129 112 Q127 123 120 123 Q113 122 109 116 Q105 112 99 110 Q92 107 91 101 Q87 99 87 95 Q88 91 93 93 Q97 95 94 100 Q99 103 107 100 Q109 96 112 97Z",ink);
    path("M95 102 Q105 106 114 101 Q114 107 106 109 Q100 108 95 102Z",glass);
    path("M103 109 Q111 113 118 109 Q115 116 110 116Z",glass);
    path("M108 109 l2 4 2 -4Z",ink);
    oval(117,98,2.5,5.1,glass,.36); oval(115.8,99,1.2,2,ink,.3);
    path("M114 92 q3 -4 7 -2 M121 85 l1 -7 m7 8 3 -9",null,glass,1.15);
    path("M99 105 l-7 -2 m9 4 -8 1 m9 1 -6 2",null,ink,.7);
    // Обе лапы сходятся на ручке корзины в каждом из двух положений.
    const y = 99 + level;
    path(`M123 126 Q114 129 106 ${y+13} L87 ${y+5} Q83 ${y+2} 80 ${y+6} M125 132 Q117 137 108 ${y+18} L87 ${y+13} Q83 ${y+15} 81 ${y+10}`,null,ink,3.8);
    ctx.translate(0,level);
    path("M63 98 Q72 94 87 98 L92 109 Q94 119 83 120 Q72 119 68 112Z",ink);
    path("M69 98 Q72 86 81 93 Q88 96 88 104",null,ink,2.2);
    path("M66 99 q9 5 21 1 m-17 6 q9 4 18 0 m-15 5 q8 3 16 0 m-13 4 2 3 m3 -3 1 3",null,glass,1);
    ctx.restore();
  }
  function egg(x,y,angle) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    path("M0 -4.8 C3 -5 4.2 -.6 3.8 2 C3.2 5.6 -3.3 5.5 -3.9 2 C-4.4 -.8 -2.5 -4.5 0 -4.8Z",ink);
    ctx.restore();
  }
  const seven = ["abcdef","bc","abdeg","abcdg","bcfg","acdfg","acdefg","abc","abcdefg","abcdfg"];
  const bars = {
    a:"M3 0h10l-2 2H4Z",b:"M14 1l-1 9-2-2 1-5Z",c:"M13 12l-1 9-2-2 1-6Z",
    d:"M1 22l2-2h7l2 2Z",e:"M0 20l1-8 2 2-1 5Z",f:"M1 10l1-9 2 2-1 5Z",g:"M2 11l2-1h6l2 1-2 1H4Z"
  };
  function digits(text) {
    ctx.save(); ctx.translate(154,10);
    for (const char of text.padStart(4," ")) {
      if(char===":") {
        ctx.globalAlpha=.96; oval(.5,7,1.2,1.2,ink); oval(-.5,15,1.2,1.2,ink);
        ctx.translate(4,0); continue;
      }
      for (const [segment,d] of Object.entries(bars)) {
        ctx.globalAlpha = char!==" " && seven[Number(char)].includes(segment) ? .96 : .055;
        path(d,ink);
      }
      ctx.translate(17,0);
    }
    ctx.restore();
  }
  function eggSegment(right,level,step) {
    const x = 20 + step*14;
    egg(right ? width-x : x,67+level+step*5.8,(right?-1:1)*step*.85);
  }
  scenery();
  ctx.save(); ctx.globalAlpha=.052;
  for(const [right,level] of Object.values(lanes)) {
    for(let i=0;i<5;i++) eggSegment(right,level,i);
  }
  wolf(false,0); wolf(true,0); ctx.restore();
  const backing=document.createElement("canvas");
  backing.width=canvas.width; backing.height=canvas.height;
  backing.getContext("2d").drawImage(canvas,0,0);
  return function draw(position,flying,time,feedback,display="0") {
    ctx.drawImage(backing,0,0,width,height);
    digits(String(display));
    wolf(...lanes[position]);
    for (const {basket,startAt,catchAt} of flying.values()) {
      const step=Math.min(4,Math.max(0,Math.floor(5*(time-startAt)/(catchAt-startAt))));
      eggSegment(...lanes[basket],step);
    }
    for (const event of feedback) {
      if(event.success) continue;
      const [right,level]=lanes[event.basket];
      ctx.save(); mirrored(right);
      if(time-event.at<110) egg(76,113+level,1.3);
      else {
        path("M64 180l4 4 2-4 2 5 3-2 1 4q-9 3-12-7Z M78 185l2-6 2 4 4-4-1 7Z",ink);
      }
      ctx.restore();
    }
  };
}

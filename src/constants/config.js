/**
 * MediaPipe 配置常量
 */
export const MEDIAPIPE_CONFIG = {
	// 使用本地 node_modules 中的 WASM 文件
	WASM_URL: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
	MODEL_URL: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
	RUNNING_MODE: "VIDEO",
	NUM_HANDS: 1,
	DELEGATE: "GPU",
};

/**
 * AR 文本配置
 */
export const AR_CONFIG = {
	TARGET_WORD: "Hi",
	FONT: "bold 80px Arial",
	FONT_COLOR: "purple",
	LETTER_SPACING: 50,
	LETTER_WIDTH: 10,
	LETTER_OFFSET_Y: 5,
};

/**
 * 手部标记配置
 */
export const HAND_MARKER_CONFIG = {
	RADIUS: 10,
	COLOR: "red",
	INDEX_FINGER_TIP: 8, // MediaPipe landmark 索引
	THUMB_TIP: 4, // 拇指指尖索引
};

/**
 * 手势配置
 */
export const GESTURE_CONFIG = {
	// Pinch 捏合阈值（像素距离）
	PINCH_THRESHOLD: 40,
	// 拖动灵敏度（0-1，值越大越灵敏）
	DRAG_SMOOTHING: 0.3,
};

/**
 * 手部骨架可视化配置
 */
export const HAND_SKELETON_CONFIG = {
	// 关键点样式
	POINT_RADIUS: 4,
	POINT_COLOR: "#00BFFF", // 蓝色
	POINT_FILL: true,

	// 连接线样式
	LINE_COLOR: "#FFFFFF", // 白色
	LINE_WIDTH: 2,

	// MediaPipe Hand Landmarks 连接关系（21个关键点）
	CONNECTIONS: [
		// 拇指
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4],
		// 食指
		[0, 5],
		[5, 6],
		[6, 7],
		[7, 8],
		// 中指
		[0, 9],
		[9, 10],
		[10, 11],
		[11, 12],
		// 无名指
		[0, 13],
		[13, 14],
		[14, 15],
		[15, 16],
		// 小指
		[0, 17],
		[17, 18],
		[18, 19],
		[19, 20],
		// 手掌底部连接
		[5, 9],
		[9, 13],
		[13, 17],
	],
};

/**
 * 摄像头配置
 */
export const CAMERA_CONFIG = {
	video: true,
};

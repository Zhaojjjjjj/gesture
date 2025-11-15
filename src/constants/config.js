/**
 * MediaPipe 配置常量
 */
export const MEDIAPIPE_CONFIG = {
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
	TARGET_WORD: "Hi Jacob",
	FONT: "bold 80px Arial",
	FONT_COLOR: "white",
	LETTER_SPACING: 80,
	LETTER_WIDTH: 40,
	LETTER_OFFSET_Y: 100,
};

/**
 * 手部标记配置
 */
export const HAND_MARKER_CONFIG = {
	RADIUS: 10,
	COLOR: "red",
	INDEX_FINGER_TIP: 8, // MediaPipe landmark 索引
};

/**
 * 摄像头配置
 */
export const CAMERA_CONFIG = {
	video: true,
};

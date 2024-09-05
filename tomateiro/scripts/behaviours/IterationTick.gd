extends Timer
class_name IterationTick

@export var pomodoro_controller : PomodoroController

var test_signal : Signal


func _ready() -> void:
	pass

func bootstrap() -> void:
	pomodoro_controller.play_signal.connect(on_play)
	pomodoro_controller.pause_signal.connect(on_pause)
	pomodoro_controller.repeat_signal.connect(on_repeat)
	pomodoro_controller.finish_signal.connect(on_finish)

	timeout.connect(on_timeout)

func on_play() -> void:
	start()

func on_pause() -> void:
	stop()

func on_repeat() -> void:
	stop()

func on_finish() -> void:
	stop()

func on_timeout() -> void:
	pomodoro_controller.tick_iteration()
	start()

func on_test() -> void:
	start()

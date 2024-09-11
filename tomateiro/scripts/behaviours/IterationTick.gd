extends Timer
class_name IterationTick

@export var cycle_time : CycleTimeController

var test_signal : Signal


func _ready() -> void:
	pass

func bootstrap() -> void:
	cycle_time.play_signal.connect(on_play)
	cycle_time.pause_signal.connect(on_pause)
	cycle_time.repeat_signal.connect(on_repeat)
	cycle_time.finish_signal.connect(on_finish)

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
	cycle_time.tick_iteration()
	start()

func on_test() -> void:
	start()

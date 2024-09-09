extends Node

@export var progress_bar : ProgressBar
@export var pomodoro_controller : PomodoroController


func _ready() -> void:
	pomodoro_controller.tick_signal.connect(on_tick)
	pomodoro_controller.repeat_signal.connect(on_repeat)
	pomodoro_controller.prepare_signal.connect(on_prepare)



func on_tick() -> void:
	update_bar()


func on_prepare() -> void:
	update_bar()

func on_repeat() -> void:
	update_bar()

func update_bar() -> void:
	progress_bar.value = (1 - pomodoro_controller.get_progress()) * 100

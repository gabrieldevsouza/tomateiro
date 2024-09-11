extends Node

@export var pomodoro_controller : PomodoroController

@export var pomodoro_timer_label : Label

func _ready() -> void:
	pomodoro_controller.tick_signal.connect(on_tick)
	pomodoro_controller.repeat_signal.connect(on_repeat)
	pomodoro_controller.prepare_signal.connect(on_prepare)
	pomodoro_controller.finish_signal.connect(on_finish)

func on_prepare() -> void:
	update_timer()

func on_tick() -> void:
	update_timer()

func on_repeat() -> void:
	update_timer()

func on_finish() -> void:
	update_timer()

func update_timer() -> void:
	pomodoro_timer_label.set_text(formart_time(pomodoro_controller.remaining_seconds.value))

func formart_time(time : float) -> String:
	var minutes = int(time / 60)
	var seconds = int(round(time)) % 60 

	var formatted_time = str(minutes).pad_zeros(2) + ":" + str(seconds).pad_zeros(2)
	return formatted_time

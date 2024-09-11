extends Node

@export var cycle_time : CycleTimeController

@export var pomodoro_timer_label : Label

func _ready() -> void:
	cycle_time.tick_signal.connect(on_tick)
	cycle_time.repeat_signal.connect(on_repeat)
	cycle_time.prepare_signal.connect(on_prepare)
	cycle_time.finish_signal.connect(on_finish)

func on_prepare() -> void:
	update_timer()

func on_tick() -> void:
	update_timer()

func on_repeat() -> void:
	update_timer()

func on_finish() -> void:
	update_timer()

func update_timer() -> void:
	pomodoro_timer_label.set_text(formart_time(cycle_time.remaining_seconds.value))

func formart_time(time : float) -> String:
	var minutes = int(time / 60)
	var seconds = int(round(time)) % 60 

	var formatted_time = str(minutes).pad_zeros(2) + ":" + str(seconds).pad_zeros(2)
	return formatted_time

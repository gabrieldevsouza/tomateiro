extends Node

@export var progress_bar : ProgressBar
@export var cycle_time : CycleTimeController


func _ready() -> void:
	cycle_time.tick_signal.connect(on_tick)
	cycle_time.repeat_signal.connect(on_repeat)
	cycle_time.prepare_signal.connect(on_prepare)
	cycle_time.finish_signal.connect(on_finish)

func on_tick() -> void:
	update_bar()

func on_prepare() -> void:
	update_bar()

func on_repeat() -> void:
	update_bar()

func on_finish() -> void:
	update_bar()

func update_bar() -> void:
	progress_bar.value = (1 - cycle_time.get_progress()) * 100

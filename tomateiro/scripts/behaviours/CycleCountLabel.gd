extends Node

@export var cycle_timer_label : Label

@export var cycle_time : CycleTimeController
@export var round_controller : RoundController

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
	# cycle_timer_label.set_text(str(round_controller.current_cycle, " / ", round_controller.setup_focus_max_amount.value))
	pass

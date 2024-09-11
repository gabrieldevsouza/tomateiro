extends Node

@export var cycle_timer_label : Label

@export var pomodoro_controller : PomodoroController


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
	cycle_timer_label.set_text(str(pomodoro_controller.current_round_cycle.get_value(), " / ", pomodoro_controller.real_cycles_amount))

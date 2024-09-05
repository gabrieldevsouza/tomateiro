extends Node
class_name PomodoroPlayer

@export var pomodoro_controller : PomodoroController

@export var pomodoro_timer_label : Label

@export var play_btn : BaseButton
@export var repeat_btn : BaseButton


func _ready() -> void:
	play_btn.pressed.connect(on_btn_play_pressed)
	repeat_btn.pressed.connect(on_btn_repeat_pressed)

	pomodoro_controller.tick_signal.connect(on_tick)
	pomodoro_controller.repeat_signal.connect(on_repeat)
	pomodoro_controller.prepare_signal.connect(on_prepare)

func on_btn_play_pressed() -> void:
	pomodoro_controller.play()

func on_btn_repeat_pressed() -> void:
	pomodoro_controller.repeat()

func on_prepare() -> void:
	print ("Prepare")
	pomodoro_timer_label.set_text(formart_time(pomodoro_controller.remaining_seconds.value))

func on_tick() -> void:
	pomodoro_timer_label.set_text(formart_time(pomodoro_controller.remaining_seconds.value))

func formart_time(time : float) -> String:
	var minutes = int(time / 60)
	var seconds = int(time) % 60 

	var formatted_time = str(minutes).pad_zeros(2) + ":" + str(seconds).pad_zeros(2)
	return formatted_time

func on_repeat() -> void:
	pomodoro_timer_label.set_text(formart_time(pomodoro_controller.remaining_seconds.value))
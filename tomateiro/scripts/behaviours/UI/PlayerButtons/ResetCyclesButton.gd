extends Control

@export var reset_button : BaseButton
@export var cycle_time : RoundController
@export var label_button : AutoSizeLabel

func _ready() -> void:
	reset_button.pressed.connect(on_reset_pressed)
	mouse_entered.connect(on_mouse_entered)
	mouse_exited.connect(on_mouse_exited)
	resized.connect(on_resize)

func on_resize() -> void:
	reset_button.size = size
	if label_button != null:
		label_button.update_font_size()

func on_reset_pressed() -> void:
	cycle_time.reset_current_cycle()

func enable_button() -> void:
	reset_button.size = size
	label_button.size = size
	label_button.update_font_size()
	reset_button.visible = true

func disable_button() -> void:
	reset_button.visible = false

func on_mouse_entered() -> void:
	enable_button()

func on_mouse_exited() -> void:
	disable_button()
